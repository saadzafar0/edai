import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Course from '@/models/courseModel';

export async function GET(request) {
  try {
    const courseId = request.url.split('/').pop();
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json({ message: 'Failed to fetch course details' }, { status: 500 });
  }
} 