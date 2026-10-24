# Human Health Management — Backend (Node.js + Express + MongoDB, Vercel-ready)

## Local chalana
```bash
npm install
cp .env.example .env      # MONGODB_URI, JWT_SECRET, CLIENT_URL bharo
npm run seed              # pehla Admin banata hai
npm run dev               # http://localhost:5000
```

## Vercel par deploy (alag project)
1. Is `backend` folder ko alag GitHub repo me daalo (ya Vercel me Root Directory = `backend` set karo).
2. Vercel → New Project → import. Framework: **Other**. Build command khali.
3. Environment Variables (Settings → Environment Variables):
   - `MONGODB_URI` — MongoDB Atlas string (Atlas → Network Access me `0.0.0.0/0` allow karo, Vercel ke IPs fixed nahi hote)
   - `JWT_SECRET` — lamba random secret
   - `CLIENT_URL` — frontend ka Vercel URL (e.g. `https://hhm-frontend.vercel.app`), multiple ho to comma se
   - optional: `ANTHROPIC_API_KEY`, `CHAT_MODEL`
4. Deploy. Check: `https://<backend>.vercel.app/api/health`
5. Pehla Admin: apne computer par `.env` me Atlas URI + `SEED_ADMIN_*` daalo aur `npm run seed` chalao.
6. Frontend project me `VITE_API_BASE_URL=https://<backend>.vercel.app` set karke redeploy.

## API
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/signup, /api/auth/login | public |
| GET | /api/auth/me | login |
| GET | /api/portal/summary | login (role ke hisaab se stats) |
| GET | /api/users | Admin |
| PATCH/DELETE | /api/users/:id | Admin (role, status, delete) |
| GET | /api/users/directory | HR, Admin |
| POST | /api/leaves | login (leave request) |
| GET | /api/leaves/mine | login |
| GET | /api/leaves?status=pending | HR, Admin |
| PATCH | /api/leaves/:id `{status:'approved'|'rejected'}` | HR, Admin |
| POST | /api/registrations, /api/contact | public (rate-limited) |
| POST | /api/chat | public (rate-limited) |

## Security notes
- Signup se hamesha `Employee` banta hai; maanga hua role `requestedRole` me jata hai, Admin approve karta hai.
- Role har request par DB se aata hai (token me nahi), login portal-selector bhi server check karta hai.
- Passwords bcrypt (12 rounds), JWT Bearer token, helmet, CORS allow-list, rate limits.
