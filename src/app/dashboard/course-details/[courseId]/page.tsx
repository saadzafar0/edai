"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  videos: { id: string; title: string; url: string }[];
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/course/${courseId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setCourseDetails(data);
        setFormData({ title: data.title, description: data.description });
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setCourseDetails(prev => prev ? { ...prev, thumbnailUrl: data.url } : null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/course/manageContent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, title: formData.title, description: formData.description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('✅ Course updated successfully!');
      setCourseDetails(prev => prev ? { ...prev, title: formData.title, description: formData.description } : null);
      setIsEditing(false);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!courseDetails) return;
    setFormData({
      title: courseDetails.title || '',
      description: courseDetails.description || ''
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!courseDetails) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full"
                disabled={isUploading}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading || loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
            {message && (
              <p className={`mt-2 ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
        ) : (
          <>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-amber-100 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{courseDetails.title}</h1>
              <p className="text-gray-700 mb-8">{courseDetails.description}</p>
            </div>

            <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-amber-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Videos</h2>
              <ul className="space-y-4">
                {(courseDetails.videos || []).map(video => (
                  <li key={video.id} className="bg-white/90 rounded-xl shadow-lg p-4 border border-amber-100">
                    <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                    <a href={video.url} className="text-indigo-500 hover:text-indigo-600">Watch Video</a>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleEditClick}
              className="mt-8 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow transition"
            >
              Edit Course
            </button>
          </>
        )}
      </div>
    </div>
  );
} 