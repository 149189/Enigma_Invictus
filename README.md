# CommunityFund — Enigma\_Invictus

**Hyper-local micro-donation & impact-tracking platform**

**Team:** Enigma\_Invictus
**Members:** Kaustubh Ratwadkar, Tanmay Dhole, Medhansh Khedekar, Yash Wagh
**Repo:** [https://github.com/149189/Enigma\_Invictus.git](https://github.com/149189/Enigma_Invictus.git)

---

## What it is

A simple platform that lets people give small, transparent donations to verified local projects and see real impact through progress trackers and milestone updates.

## Tech Stack

* **Frontend:** Next.js
* **Backend / Auth:** Node.js
* **Database:** MongoDB
* **AI service:** Django (for verification / summarization)

## Key features (short)

* Project submission & moderator verification
* Micro-donations and payment gateway (test mode)
* Project progress & milestone updates
* AI-assisted verification

## Quick start (dev)

1. Clone repo:

```bash
git clone https://github.com/149189/Enigma_Invictus.git
cd Enigma_Invictus
```

2. Start MongoDB (local or Docker).
3. Backend:

```bash
cd backend
cp .env.example .env   # fill values
npm install
npm run dev
```

4. Frontend:

```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

5. (Optional) AI service:

```bash
cd ../ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 8001
```

## Env (minimal)

* `MONGO_URI`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `RAZORPAY_KEY_ID/SECRET`, `AI_SERVICE_URL`

## Contact

Enigma\_Invictus — Kaustubh, Tanmay, Medhansh, Yash

