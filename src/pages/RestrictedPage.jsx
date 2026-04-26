import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function RestrictedPage() {
  const { userData, logout, isAccountRestricted } = useAuth();
  const restriction = isAccountRestricted();

  if (!restriction) {
    return window.location.href = '/';
  }

  const isSuspended = restriction === 'suspended';
  const resumeDate = userData?.suspendedUntil?.toDate ? userData.suspendedUntil.toDate().toLocaleDateString() : 'TBD';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-white border-none shadow-2xl rounded-[40px] p-10 md:p-16 text-center overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>

        <div className="relative z-10">
          <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg ${isSuspended ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
            {isSuspended ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            )}
          </div>

          <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${isSuspended ? 'text-amber-500' : 'text-red-500'}`}>
            Access Restricted
          </p>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#2b3231] mb-6 tracking-tight">
            Account {restriction === 'suspended' ? 'Suspended' : 'Permanently Banned'}
          </h1>
          
          <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {isSuspended 
                ? `Your account access has been temporarily limited due to violations of our community guidelines. You will be able to return soon.`
                : `Your account has been permanently disabled due to severe or repeated violations of our terms. This decision is final.`}
            </p>
            {isSuspended && (
              <div className="flex items-center justify-center gap-2 text-[#129780] font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Suspension expires on {resumeDate}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => logout()}
              variant="outline"
              className="rounded-full px-10 py-4 font-bold border-2 hover:bg-gray-50 min-w-[200px]"
            >
              Sign Out
            </Button>
            <Button 
              onClick={() => window.location.href = 'mailto:support@helpify.com'}
              className="bg-[#129780] rounded-full px-10 py-4 font-bold shadow-lg shadow-[#129780]/20 min-w-[200px]"
            >
              Contact Support
            </Button>
          </div>

          <p className="mt-12 text-gray-400 text-sm font-medium">
            Reason: {userData?.moderationNote || 'Multiple community reports for inappropriate behavior.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
