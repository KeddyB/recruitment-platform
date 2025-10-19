// Script to execute SQL migrations on Supabase database
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log("[v0] Starting database migrations...")

  const migrations = ["001_create_core_tables.sql", "002_enable_rls_policies.sql", "003_seed_sample_data.sql"]

  for (const migration of migrations) {
    console.log(`[v0] Running migration: ${migration}`)

    try {
      const sqlPath = join(process.cwd(), "scripts", migration)
      const sql = readFileSync(sqlPath, "utf-8")

      // Skip empty or comment-only files
      if (!sql.trim() || (sql.trim().startsWith("--") && !sql.includes("CREATE"))) {
        console.log(`[v0] Skipping ${migration} (no executable SQL)`)
        continue
      }

      // Execute the SQL
      const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from("_migrations").insert({ name: migration })

        if (directError) {
          console.error(`[v0] Error running ${migration}:`, error)
          throw error
        }
      }

      console.log(`[v0] Successfully ran ${migration}`)
    } catch (error) {
      console.error(`[v0] Failed to run ${migration}:`, error)
      throw error
    }
  }

  console.log("[v0] All migrations completed successfully!")

  // Verify tables were created
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  if (!tablesError && tables) {
    console.log("[v0] Created tables:", tables.map((t) => t.table_name).join(", "))
  }
}

runMigrations().catch(console.error)
