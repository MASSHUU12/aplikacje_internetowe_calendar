# Setup

> This setup assumes the use of Docker.

1. **Clone the repository:**

```bash
git clone https://github.com/MASSHUU12/aplikacje_internetowe_calendar.git && cp ipz
# or via SSH: git@github.com:MASSHUU12/aplikacje_internetowe_calendar.git
```

2. **Set up the environment file:**

```bash
cp .env.example .env
```

3. **Set up Docker containers:**

```bash
docker-compose build # required only once or when Dockerfile have changed
docker-compose up -d
```

phpMyAdmin is available under port **6969**.

4. **Connect to the container:**

> [!NOTE]
> If this command fails check container name using `docker ps`.

```bash
docker exec -it aplikacje_internetowe_calendar-server-1 /bin/bash
```

5. **Install PHP dependencies:**

```bash
composer install
```

6. **Generate the application key:**

```bash
php artisan key:generate
```

7. **Run database migrations:**

```bash
php artisan migrate:fresh
```

8. **Run the development server (API):**

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

API will be available at `http://localhost:8000`.

9. **Run the React development server (frontend) in a separate terminal:**

```bash
bun install
bun run dev
```

Frontend will be available at `http://localhost:8000`.
