
from sqlalchemy import inspect, text

from database import engine, Base
import models


# Create new tables, including users
Base.metadata.create_all(bind=engine)

# Check existing columns in memories
inspector = inspect(engine)

columns = [
    column["name"]
    for column in inspector.get_columns("memories")
]

# Add user_id only if it doesn't exist
if "user_id" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE memories "
                "ADD COLUMN user_id INTEGER REFERENCES users(id)"
            )
        )

    print("Migration completed: user_id added!")

else:
    print("Migration already completed!")

print("Database migration finished.")
