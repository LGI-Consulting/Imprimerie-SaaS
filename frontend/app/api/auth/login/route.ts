import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // In a real application, you would validate credentials against your database
    // This is just a mock implementation

    // Check if this is a superadmin
    if (email === "admin@example.com" && password === "password123") {
      return NextResponse.json({
        success: true,
        user: {
          id: "super-admin-id",
          email,
          name: "Super Admin",
          role: "superadmin",
        },
        redirect: "/superadmin",
      })
    }

    // For regular users, return available tenants
    // In a real app, you would query your database for tenants this user has access to
    return NextResponse.json({
      success: true,
      user: {
        id: "user-id",
        email,
        name: "John Doe",
      },
      tenants: [
        { id: "1", name: "PrintTech Main Branch", role: "Admin" },
        { id: "2", name: "PrintTech Downtown", role: "Manager" },
        { id: "3", name: "PrintTech East Side", role: "Cashier" },
        { id: "4", name: "PrintTech West Mall", role: "Designer" },
        { id: "5", name: "PrintTech North Office", role: "Reception" },
      ],
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
