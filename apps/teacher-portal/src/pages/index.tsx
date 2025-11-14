import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Teacher Portal - Altera School Management</title>
        <meta name="description" content="Teacher portal for Altera School Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Teacher Portal
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Manage your classes, track student progress, and streamline your teaching workflow
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Class Management</h3>
                <p className="text-gray-600 mb-4">
                  Organize your classes, manage student enrollment, and track attendance
                </p>
                <button 
                  onClick={() => router.push('/classes')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Manage Classes
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Grade Management</h3>
                <p className="text-gray-600 mb-4">
                  Record grades, generate reports, and track student performance
                </p>
                <button 
                  onClick={() => router.push('/grades')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Manage Grades
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Student Analytics</h3>
                <p className="text-gray-600 mb-4">
                  View detailed analytics and insights about student progress
                </p>
                <button 
                  onClick={() => router.push('/analytics')}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
