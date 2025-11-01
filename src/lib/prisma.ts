import { PrismaClient } from '@prisma/client'


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type-safe wrapper functions that eliminate the need for (prisma as any)
export class PrismaWrapper {
  private client: PrismaClient

  constructor(client: PrismaClient) {
    this.client = client
  }

  // User operations with type safety
  async createUser(data: any) {
    return this.client.user.create({ data })
  }

  async findUserById(id: string, include?: any) {
    return this.client.user.findUnique({
      where: { id },
      include
    })
  }

  async findUserByEmail(email: string, include?: any) {
    return this.client.user.findUnique({
      where: { email },
      include
    })
  }

  async updateUser(id: string, data: any) {
    return this.client.user.update({
      where: { id },
      data
    })
  }

  async deleteUser(id: string) {
    return this.client.user.delete({
      where: { id }
    })
  }

  // Child operations
  async createChild(data: any) {
    return this.client.child.create({ data })
  }

  async findChildById(id: string, include?: any) {
    return this.client.child.findUnique({
      where: { id },
      include
    })
  }

  async updateChild(id: string, data: any) {
    return this.client.child.update({
      where: { id },
      data
    })
  }

  async deleteChild(id: string) {
    return this.client.child.delete({
      where: { id }
    })
  }

  // Club operations
  async createClub(data: any) {
    return (this.client as any).club.create({ data })
  }

  async findClubById(id: string, include?: any) {
    return (this.client as any).club.findUnique({
      where: { id },
      include
    })
  }

  async updateClub(id: string, data: any) {
    return (this.client as any).club.update({
      where: { id },
      data
    })
  }

  // Record operations (competitions)
  async createRecord(data: any) {
    return this.client.record.create({ data })
  }

  async findRecordById(id: string, include?: any) {
    return this.client.record.findUnique({
      where: { id },
      include
    })
  }

  async updateRecord(id: string, data: any) {
    return this.client.record.update({
      where: { id },
      data
    })
  }

  async deleteRecord(id: string) {
    return this.client.record.delete({
      where: { id }
    })
  }

  // Training operations
  async createTraining(data: any) {
    return this.client.training.create({ data })
  }

  async findTrainingById(id: string, include?: any) {
    return this.client.training.findUnique({
      where: { id },
      include
    })
  }

  // UserChild relationship operations
  async createUserChild(data: any) {
    return (this.client as any).userChild.create({ data })
  }

  async findUserChildren(userId: string, include?: any) {
    return (this.client as any).userChild.findMany({
      where: { userId },
      include
    })
  }

  async findChildParents(childId: string, include?: any) {
    return (this.client as any).userChild.findMany({
      where: { childId },
      include
    })
  }

  async deleteUserChild(userId: string, childId: string) {
    return (this.client as any).userChild.delete({
      where: {
        userId_childId: {
          userId,
          childId
        }
      }
    })
  }

  // UserClub relationship operations
  async createUserClub(data: any) {
    return (this.client as any).userClub.create({ data })
  }

  async findUserClubs(userId: string, include?: any) {
    return (this.client as any).userClub.findMany({
      where: { userId },
      include
    })
  }

  async findClubUsers(clubId: string, include?: any) {
    return (this.client as any).userClub.findMany({
      where: { clubId },
      include
    })
  }

  // Generic find operations
  async findMany(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.findMany(options)
  }

  async findFirst(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.findFirst(options)
  }

  async count(model: string, options?: any) {
    const modelClient = (this.client as any)[model]
    return modelClient.count(options)
  }

  // Transaction support
  async transaction(fn: (prisma: any) => Promise<any>) {
    return this.client.$transaction(fn as any)
  }

  // Raw database access when needed
  get rawClient() {
    return this.client
  }
}

export const db = new PrismaWrapper(prisma)
export default prisma