import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const bloodRequests = db.collection('bloodRequests')

    // Bağış istatistiklerini al
    const donations = await bloodRequests.aggregate([
      { 
        $match: { 
          'donors.email': session.user.email
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]).toArray()

    // İstek istatistiklerini al
    const requests = await bloodRequests.aggregate([
      { 
        $match: { 
          requesterEmail: session.user.email
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]).toArray()

    const stats = {
      donations: donations[0] ? {
        total: donations[0].total,
        completed: donations[0].completed,
        pending: donations[0].pending
      } : {
        total: 0,
        completed: 0,
        pending: 0
      },
      requests: requests[0] ? {
        total: requests[0].total,
        completed: requests[0].completed,
        active: requests[0].active
      } : {
        total: 0,
        completed: 0,
        active: 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 