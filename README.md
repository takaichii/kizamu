# kizamu

## 開発環境のセットアップ

### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) がインストール済みであること
- Node.js 20 以上

### 手順

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/takaichii/kizamu.git
   cd kizamu
   ```

2. **依存パッケージをインストール**

   ```bash
   npm install
   ```

3. **環境変数を設定**

   ```bash
   cp .env.example .env
   ```

   `.env` を必要に応じて編集してください。

4. **Docker でデータベースを起動**

   ```bash
   docker-compose up -d db
   ```

5. **マイグレーションを実行**

   ```bash
   npx prisma migrate deploy
   ```

6. **初期データを投入（任意）**

   ```bash
   npx prisma db seed
   ```

   以下のサンプルデータが投入されます：

   - テストユーザー（`dev@example.com`）
   - 人生方針 3 件（健康・成長・冒険）
   - バケットリスト 4 件
   - デイリーエントリー 2 件（今日・昨日）
   - 2026 年 Q2 マンダラ

7. **開発サーバーを起動**

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) にアクセスしてください。

### Docker Compose でアプリごと起動する場合

```bash
docker-compose up
```

> マイグレーションとシードは手動で実行する必要があります（上記手順 5〜6）。
