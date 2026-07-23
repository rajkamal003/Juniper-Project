# database/init_db.py
import os
import pymysql
import re

DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "root"
DB_NAME = "securecampus_db"
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def init_database():
    print("Connecting to MySQL server at {}:{}...".format(DB_HOST, DB_PORT))
    
    # Connect without database first to create it
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        autocommit=True
    )
    
    try:
        with connection.cursor() as cursor:
            # Create database
            print("Dropping database if exists: {}...".format(DB_NAME))
            cursor.execute("DROP DATABASE IF EXISTS securecampus_db;")
            print("Creating database: {}...".format(DB_NAME))
            cursor.execute("CREATE DATABASE securecampus_db;")
            
            # Switch to database
            cursor.execute("USE securecampus_db;")
            
            # Read schema.sql
            print("Reading schema definition from {}...".format(SCHEMA_PATH))
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            
            # Split schema queries (basic parsing, handling comments and empty lines)
            # Remove single line comments
            schema_sql = re.sub(r'--.*?\n', '', schema_sql)
            
            # Split by semicolon
            queries = schema_sql.split(";")
            
            print("Executing schema queries...")
            for query in queries:
                q = query.strip()
                if not q:
                    continue
                try:
                    cursor.execute(q)
                except Exception as e:
                    print("Error executing query: {}".format(q[:50]))
                    print("Error details: {}".format(e))
                    raise e
                    
        print("Database initialization completed successfully!")
    finally:
        connection.close()

if __name__ == "__main__":
    init_database()
