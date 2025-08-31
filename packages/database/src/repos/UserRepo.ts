import bcrypt from "bcryptjs";
import { Prisma, type User } from "../schema";
import { prisma } from "../client";

// Types for user operations
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  avatar?: string; // 头像名称字符串，如 'user', 'tie', 'robot' 等
}

export interface LoginInput {
  email: string;
  password: string;
}

// Error McpInterfaces.ts
export class UserExistsError extends Error {
    constructor(message = "这个邮箱已被注册，请使用其他邮箱...") {
        super(message);
        this.name = "UserExistsError";
    }
}

export class UserNotFoundError extends Error {
    constructor(message = "该用户未存在...") {
        super(message);
        this.name = "UserNotFoundError";
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message = "Invalid credentials") {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

async function comparePasswords(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export const userRepo = Prisma.defineExtension({
    name: "UserRepo",
    model: {
        user: {
            async createUser(data: CreateUserInput): Promise<User> {
                // Check if user with this email already exists
                const existingUserByEmail = await prisma.user.findUnique({
                    where: { email: data.email },
                });

                if (existingUserByEmail) {
                    throw new UserExistsError('这个邮箱已被注册');
                }
                const hashedPassword = await hashPassword(data.password);

                return prisma.user.create({
                    data: {
                        email: data.email,
                        name: data.name,
                        password: hashedPassword,
                        avatar: data.avatar ?? "user", // 使用传入的avatar值，如果未提供则默认为"user"
                    },
                });
            },
            async getUserByEmail(email: string): Promise<User | null> {
                return prisma.user.findUnique({
                    where: { email },
                });
            },
            async getUserById(id: string): Promise<User | null> {
                return prisma.user.findUnique({
                    where: { id },
                });
            },
            async loginUser(data: LoginInput): Promise<User> {
                // Find the user
                const user = await this.getUserByEmail(data.email);

                if (!user) {
                    throw new UserNotFoundError();
                }

                // Verify password
                const isPasswordValid = await comparePasswords(data.password, user.password);

                if (!isPasswordValid) {
                    throw new InvalidCredentialsError();
                }

                return user;
            },
            async updateUser(
                id: string,
                data: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "password">>
            ): Promise<User> {
                return prisma.user.update({
                    where: { id },
                    data,
                });
            },
            async updateUserPassword(
                id: string,
                newPassword: string
            ): Promise<User> {
                const hashedPassword = await hashPassword(newPassword);

                return prisma.user.update({
                    where: { id },
                    data: { password: hashedPassword },
                });
            },
            async deleteUser(id: string): Promise<User> {
                return prisma.user.delete({
                    where: { id },
                });
            }
        }
    }
})