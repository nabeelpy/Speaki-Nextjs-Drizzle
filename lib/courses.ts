import "server-only";

import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import type { Course, Lesson } from './types'

export interface CourseWithLessons extends Omit<Course, 'lessons'> {
  lessons: Lesson[]
  lessonsCount?: number
}

export interface GetCoursesFilters {
  level?: string
  category?: string
  search?: string
}

/**
 * Get courses with optional filters (level, category, search).
 * Used by GET /api/courses.
 */
export async function getCourses(filters: GetCoursesFilters = {}): Promise<Course[]> {
  const { level, category, search } = filters
  const predicates = []

  if (level) {
    predicates.push(eq(courses.level, level as any))
  }
  if (category) {
    predicates.push(ilike(courses.category, `%${category.toLowerCase()}%`))
  }
  if (search) {
    const q = `%${search.toLowerCase()}%`
    predicates.push(
      or(
        ilike(courses.title, q),
        ilike(courses.description, q),
        ilike(courses.instructor, q),
      ),
    )
  }

  try {
    const rows = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        category: courses.category,
        thumbnail: courses.thumbnail,
        duration: courses.duration,
        lessons: courses.lessonsCount,
        instructor: courses.instructor,
        xpReward: courses.xpReward,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        ratingCount: courses.ratingCount,
        isTrending: courses.isTrending,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(predicates.length ? and(...predicates) : undefined)
      .orderBy(desc(courses.createdAt))

    return rows.map((row) => ({
      ...row,
      rating: Number(row.rating),
      ratingCount: Number(row.ratingCount),
      isTrending: Boolean(row.isTrending),
      createdAt: new Date(row.createdAt).toISOString()
    }))
  } catch (error) {
    console.error("Database Error:", error)
    return []
  }
}

/**
 * Get a single course by id with its lessons.
 * Used by GET /api/courses/[id].
 */
export async function getCourseById(id: string): Promise<CourseWithLessons | null> {
  try {
    const courseRows = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        category: courses.category,
        thumbnail: courses.thumbnail,
        duration: courses.duration,
        lessons: courses.lessonsCount,
        instructor: courses.instructor,
        xpReward: courses.xpReward,
        enrollmentCount: courses.enrollmentCount,
        rating: courses.rating,
        ratingCount: courses.ratingCount,
        isTrending: courses.isTrending,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1)

    if (courseRows.length === 0) return null

    const course = courseRows[0]

    const lessonRows = await db
      .select({
        id: lessons.id,
        courseId: lessons.courseId,
        title: lessons.title,
        description: lessons.description,
        content: lessons.content,
        duration: lessons.duration,
        videoUrl: lessons.videoUrl,
        order: lessons.elementOrder,
        conversationId: lessons.conversationId,
      })
      .from(lessons)
      .where(eq(lessons.courseId, id))
      .orderBy(lessons.elementOrder) as Lesson[]

    return {
      ...course,
      rating: Number(course.rating),
      ratingCount: Number(course.ratingCount),
      isTrending: Boolean(course.isTrending),
      createdAt: new Date(course.createdAt).toISOString(),
      lessons: lessonRows
    }
  } catch (error) {
    console.error("Database Error:", error)
    return null
  }
}
