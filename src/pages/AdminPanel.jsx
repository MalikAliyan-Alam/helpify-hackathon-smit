import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'reports', 'users'
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [note, setNote] = useState('');

  // Security check: Only admins can view this page
  const isAdmin = userData?.role === 'admin' || currentUser?.email === 'admin@helpify.com';

  useEffect(() => {
    if (!isAdmin) return;

    const qV = query(collection(db, 'verifications'), where('status', '==', 'pending'));
    const unsubV = onSnapshot(qV, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qR = query(collection(db, 'reports'), where('status', '==', 'pending'));
    const unsubR = onSnapshot(qR, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qU = query(collection(db, 'users'));
    const unsubU = onSnapshot(qU, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => {
      unsubV();
      unsubR();
      unsubU();
    };
  }, [isAdmin]);

  const handleReview = async (app, status) => {
    try {
      // 1. Update verification document
      await updateDoc(doc(db, 'verifications', app.id), { 
        status, 
        adminNote: note,
        reviewedAt: serverTimestamp() 
      });

      // 2. If approved, update user document
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', app.userId), {
          verified: true,
          verifiedSkill: app.skillCategory,
          trustScore: 100 // Boost to max trust score for experts
        });
      }

      // 3. Notify user
      await addDoc(collection(db, 'notifications'), {
        userId: app.userId,
        message: status === 'approved' 
          ? `Congratulations! Your verification as a ${app.skillCategory} expert has been approved. ✅`
          : `Your verification application was rejected. Admin Note: ${note || 'No additional notes provided.'}`,
        type: 'System',
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success(`Application ${status}`);
      setNote('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process application');
    }
  };

  const handleReportAction = async (report, action) => {
    try {
      const userRef = doc(db, 'users', report.reportedUserId);
      
      // 1. Update report status
      await updateDoc(doc(db, 'reports', report.id), { status: action, adminNote: note });

      if (action === 'dismiss') {
        toast.success('Report dismissed');
        return;
      }

      // 2. Take action on user
      if (action === 'warn') {
        await addDoc(collection(db, 'notifications'), {
          userId: report.reportedUserId,
          message: `⚠️ Warning: You have received a formal warning for "${report.reason}". Admin Note: ${note || 'N/A'}`,
          type: 'Warning',
          createdAt: serverTimestamp(),
          read: false
        });
        await updateDoc(userRef, { trustScore: increment(-10) });
      } else if (action === 'suspend') {
        const resumeDate = new Date();
        resumeDate.setDate(resumeDate.getDate() + 7);
        await updateDoc(userRef, { 
          accountStatus: 'suspended', 
          suspendedUntil: resumeDate,
          trustScore: increment(-30)
        });
        await addDoc(collection(db, 'notifications'), {
          userId: report.reportedUserId,
          message: `🚫 Your account has been suspended for 7 days for "${report.reason}".`,
          type: 'Warning',
          createdAt: serverTimestamp(),
          read: false
        });
      } else if (action === 'ban') {
        await updateDoc(userRef, { accountStatus: 'banned', trustScore: 0 });
        await addDoc(collection(db, 'notifications'), {
          userId: report.reportedUserId,
          message: `🛑 Your account has been permanently banned for "${report.reason}".`,
          type: 'Warning',
          createdAt: serverTimestamp(),
          read: false
        });
      }

      toast.success(`Action taken: ${action}`);
      setNote('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process report action');
    }
  };

  const updateUser = async (userId, data) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      toast.success('User updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">ADMINISTRATION</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">Admin Control Center</h1>
          
          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('verifications')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'verifications' ? 'bg-[#129780] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Verifications ({applications.length})
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'reports' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Reports ({reports.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[#2b3231] text-white border border-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Manage Users ({users.length})
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading data...</div>
        ) : activeTab === 'verifications' ? (
          // ... (Existing verifications code)
          applications.length === 0 ? (
            <Card className="bg-white border-none shadow-sm rounded-[24px] p-12 text-center">
              <h3 className="text-xl font-bold text-[#2b3231]">No pending applications</h3>
              <p className="text-gray-500 mt-2">All experts are verified!</p>
            </Card>
          ) : (
            applications.map(app => (
              <Card key={app.id} className="bg-white border-none shadow-lg rounded-[32px] p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-[#2b3231]">{app.userName}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{app.userEmail}</p>
                    </div>
                    <div className="bg-[#f0f9f8] text-[#129780] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {app.skillCategory}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Experience</p>
                      <p className="text-sm font-semibold">{app.experience}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Portfolio</p>
                      {app.portfolio ? (
                        <a href={app.portfolio} target="_blank" rel="noreferrer" className="text-sm text-[#129780] hover:underline font-semibold">View Work ↗</a>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No link</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Expert Bio</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{app.bio}</p>
                  </div>
                </div>
                <div className="w-full md:w-[280px] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Admin Notes</label>
                  <textarea 
                    placeholder="Optional note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] min-h-[80px] resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleReview(app, 'approved')} className="bg-[#129780] rounded-full py-3 font-bold text-xs">Approve</Button>
                    <Button onClick={() => handleReview(app, 'rejected')} variant="destructive" className="bg-red-500/10 text-red-500 border-none rounded-full py-3 font-bold text-xs hover:bg-red-500 hover:text-white">Reject</Button>
                  </div>
                </div>
              </Card>
            ))
          )
        ) : activeTab === 'reports' ? (
          reports.length === 0 ? (
            <Card className="bg-white border-none shadow-sm rounded-[24px] p-12 text-center">
              <h3 className="text-xl font-bold text-[#2b3231]">No pending reports</h3>
              <p className="text-gray-500 mt-2">Community is behaving well!</p>
            </Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className="bg-white border-none shadow-lg rounded-[32px] p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1">Reported User</p>
                      <h4 className="text-xl font-bold text-[#2b3231]">{report.reportedUserName}</h4>
                    </div>
                    <div className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {report.reason}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Issue Details</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{report.details || 'No additional details provided.'}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                    <span>Reported by: User {report.reporterId.substring(0, 5)}...</span>
                    <span>•</span>
                    <span>Context: {report.requestId}</span>
                  </div>
                </div>

                <div className="w-full md:w-[320px] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Action Response</label>
                  <textarea 
                    placeholder="Note for the user..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px] resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleReportAction(report, 'warn')} className="bg-amber-500 hover:bg-amber-600 rounded-full py-2.5 font-bold text-[10px]">Warn</Button>
                    <Button onClick={() => handleReportAction(report, 'suspend')} className="bg-orange-600 hover:bg-orange-700 rounded-full py-2.5 font-bold text-[10px]">Suspend</Button>
                    <Button onClick={() => handleReportAction(report, 'ban')} variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-full py-2.5 font-bold text-[10px]">Ban User</Button>
                    <Button onClick={() => handleReportAction(report, 'dismiss')} className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none rounded-full py-2.5 font-bold text-[10px]">Dismiss</Button>
                  </div>
                </div>
              </Card>
            ))
          )
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <div className="bg-gray-100 p-2 rounded-xl text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
               </div>
               <input 
                 type="text" 
                 placeholder="Search by name or email..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700"
               />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {users.filter(u => 
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(u => (
                <Card key={u.id} className="bg-white border-none shadow-md rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#2b3231] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#2b3231]">{u.name}</h4>
                        {u.verified && <span className="text-[#129780] bg-[#129780]/10 p-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center md:text-right">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Trust Score</p>
                       <p className={`text-sm font-bold ${u.trustScore >= 80 ? 'text-[#129780]' : u.trustScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{u.trustScore}%</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Role</p>
                      <select 
                        value={u.role || 'user'}
                        onChange={(e) => updateUser(u.id, { role: e.target.value })}
                        className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#129780]/20"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                      <select 
                        value={u.accountStatus || 'active'}
                        onChange={(e) => updateUser(u.id, { accountStatus: e.target.value })}
                        className={`border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-[#129780]/20 ${
                          u.accountStatus === 'banned' ? 'bg-red-100 text-red-600' : 
                          u.accountStatus === 'suspended' ? 'bg-amber-100 text-amber-600' : 
                          'bg-green-100 text-green-600'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
