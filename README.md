## Overview

This is a loan acquisition sign up form. Being creative I took a liberty of adding a Neon (Postgres) database and a mocked Salesforce API integration. So that form can be seen in action from end to end. This document describes the design process, data modelling, choices, and more implementation details.

It has multi-step form with validation. Form handle the state and validation using React Hook Form. Here are some of the things you need to know about this project.

- All types are kept in `lib/types.ts` file.
- We have 3 components `Header`, `Footer` and `LeadAcquisition` form with all UI related components in `ui` folder (like button, toast, select etc).
- `LeadAcquisition` form has 4 steps (each step is a component to keep it clean):
  - `LoanDetails`
  - `PersonalDetails`
  - `Verification`
  - `LoanApplication`
- `Verification` step has OTP verification.
- `LoanApplication` step has a mocked Salesforce API integration.
- Database schema, connection and migrations are handled by Prisma.

## Tech Stack

- Next.js (with App Router)
  - Full stack framework that can handle both client and server side rendering. Makes easy to build and deploy fast.
- Shadcn UI
  - UI library that can be used to style the components.
  - Uses Radix UI under the hood which is good for accessibility and can be used to build complex UI components.
  - Uses Tailwind CSS under the hood which is utility-first and can be used to style the components.
- Neon (Postgres)
  - Postgres database, easy installation and setup.
- React Hook Form
  - Form library that can be used to handle the form state and validation.
  - Will help use to handle the form state and validation.

## Installation and Setup

To run the project locally, clone the repository and run:
`npm install`

Go to [neon.tech](https://neon.tech) and create a new database and get the connection string.
Create a `.env` file in the root directory and add the following.

```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
```

And run `npm run dev` to start the project.

If you need to change the database schema, you can use Prisma to do so.
`npx prisma migrate dev --name <migration_name>`
`npx prisma db push`

Drop development database:
`npx prisma migrate reset --force`

## Key features

- Progress tracking with visual indicators
- Step validation before moving to next step
- data persistence across steps using react-hook-form
- responsive design
- field level error handling with input-specific error messages
- step-level error display
- otp to verify the user and for bot protection
