# Database Setup Instructions

## 1. Environment Variables

Add your Neon database URL to your `.env` file:

```env
DATABASE_URL="postgresql://username:password@your-neon-host/dbname?sslmode=require"
```

## 2. Run Database Migration

Create and apply the database schema:

```bash
# Create the migration
npx prisma migrate dev --name init

# Or if you want to push schema without migration files
npx prisma db push
```

## 3. Generate Prisma Client

```bash
npx prisma generate
```

## 4. Optional: Seed Database (if needed)

Create a seed file `prisma/seed.ts` if you want to add initial data.

## 5. View Database (Optional)

```bash
npx prisma studio
```

This will open a web interface to view and edit your database.

## Database Schema Overview

### Tables Created:

- **leads**: Main lead information
- **lead_metadata**: Session and device tracking
- **logs**: External system integration logs
- **verifications**: Email/phone verification tokens

### Features:

- ✅ UUID primary keys
- ✅ Proper relationships with foreign keys
- ✅ Cascade deletes for data integrity
- ✅ Enums for type safety
- ✅ Decimal precision for currency
- ✅ Automatic timestamps
- ✅ Unique constraints where needed

## API Endpoints

- `POST /api/loan-application` - Submit loan application
- `GET /api/loan-application` - Health check

## Next Steps

1. Add your DATABASE_URL to `.env`
2. Run `npx prisma migrate dev --name init`
3. Test the form submission
4. Add Salesforce integration to the API route
5. Implement email/phone verification flows
