// Direct database setup using Supabase client
// This creates all tables programmatically

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupDatabase() {
  console.log("[v0] Setting up database schema...")

  try {
    // Read and execute the SQL files
    const fs = await import("fs/promises")
    const path = await import("path")

    const migrations = ["001_create_core_tables.sql", "002_enable_rls_policies.sql"]

    for (const migrationFile of migrations) {
      console.log(`[v0] Executing ${migrationFile}...`)

      const sqlPath = path.join(process.cwd(), "scripts", migrationFile)
      const sql = await fs.readFile(sqlPath, "utf-8")

      // Split by semicolons and execute each statement
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"))

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", {
            query: statement,
          })

          if (error) {
            console.error(`[v0] Error executing statement:`, error)
            console.error(`[v0] Statement was:`, statement.substring(0, 100))
          }
        }
      }

      console.log(`[v0] Completed ${migrationFile}`)
    }

    console.log("[v0] Database setup complete!")

    // Test by checking if tables exist
    const { data, error } = await supabase.from("companies").select("count").limit(1)

    if (!error) {
      console.log("[v0] ✓ Tables created successfully!")
    } else {
      console.log("[v0] Note: Tables may need to be created via Supabase dashboard")
      console.log("[v0] Error:", error.message)
    }
  } catch (error) {
    console.error("[v0] Setup failed:", error)
  }
}

setupDatabase()
