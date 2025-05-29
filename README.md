# Next.js Todo List with Supabase

A collaborative Todo List application built with **Next.js** and **Supabase**.  
Users can create tasks, assign them to other registered users, set due dates, filter tasks, and receive real-time notifications when tasks are assigned.

---

## Features

- **User Authentication** (Supabase Auth)
- **Assign tasks** to any registered user
- **Due dates** for tasks
- **Filter tasks**: All, Assigned to Me, Created by Me, Overdue, Due Today
- **Real-time notifications** when tasks are assigned
- **Row Level Security** for all data
- **Responsive UI** with React and Tailwind CSS

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/nextjs-todo-list.git
cd nextjs-todo-list
```

---

### 2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

---

### 3. **Set Up Supabase**

1. [Create a Supabase project](https://app.supabase.com/).
2. Go to **Project Settings → API** and copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. In your Supabase dashboard, go to **SQL Editor** and run the migration SQL in `supabase/migrations/20230712094349_init.sql` to set up tables, triggers, and policies.

---

### 4. **Configure Environment Variables**

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 5. **Run the Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### **Sign Up / Log In**
- Register a new user or log in with an existing account.

### **Add a Task**
- Enter a task (minimum 4 characters).
- Select a user to assign the task to (dropdown).
- Pick a due date.
- Click **Add**.

### **Filters**
- **All:** Show all tasks.
- **Assigned to Me:** Tasks assigned to you.
- **Created by Me:** Tasks you created.
- **Overdue:** Tasks assigned to you with a past due date.
- **Due Today:** Tasks assigned to you due today.

### **Notifications**
- When a task is assigned to you, a real-time notification appears.

---

## Database Structure

### **profiles**
| Column | Type | Description |
|--------|------|-------------|
| id     | uuid | User ID (from auth.users) |
| email  | text | User email |

### **todos**
| Column      | Type    | Description                |
|-------------|---------|----------------------------|
| id          | bigint  | Primary key                |
| user_id     | uuid    | Creator's user ID          |
| task        | text    | Task description           |
| is_complete | boolean | Task completion status     |
| inserted_at | timestamp | Creation time            |
| assigned_to | uuid    | Assigned user's ID         |
| due_date    | date    | Due date                   |

### **notifications**
| Column       | Type      | Description                |
|--------------|-----------|----------------------------|
| id           | bigint    | Primary key                |
| recipient_id | uuid      | User receiving notification|
| sender_id    | uuid      | User who assigned the task |
| todo_id      | bigint    | Related task ID            |
| message      | text      | Notification message       |
| is_read      | boolean   | Read status                |
| created_at   | timestamp | Notification time          |

---

## Deployment

### **Deploy to Vercel**

1. Push your code to GitHub (or GitLab/Bitbucket).
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard.
4. Click **Deploy**.

---

## Troubleshooting

- **No users in "Assign to..." dropdown:**  
  Make sure your `profiles` table is populated and RLS allows `select`.
- **Cannot add tasks:**  
  Ensure all required fields are filled and your Supabase policies are correct.
- **No tables in Supabase:**  
  Make sure you ran the migration SQL in the SQL Editor.

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Contact

For questions or support, open an issue or contact [your-email@example.com](hritik.hritiksingh@gmail.com).
