import type { Dialect } from "./parser";

export const SAMPLES: Record<Dialect, string> = {
  sql: `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);`,

  mongo: `// Users collection
{
  _id: ObjectId,
  email: String,
  username: String,
  profile: {
    bio: String,
    avatar_url: String
  },
  created_at: Date
}

// Posts collection
{
  _id: ObjectId,
  user_id: ObjectId, // ref: Users
  title: String,
  body: String,
  tags: [String],
  published: Boolean,
  created_at: Date
}

// Comments collection
{
  _id: ObjectId,
  post_id: ObjectId, // ref: Posts
  user_id: ObjectId, // ref: Users
  content: String,
  created_at: Date
}`,

  prisma: `model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username  String
  posts     Post[]
  comments  Comment[]
  createdAt DateTime  @default(now())
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  body      String?
  published Boolean   @default(false)
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  tags      Tag[]
  createdAt DateTime  @default(now())
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  post      Post     @relation(fields: [postId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}`,

  django: `class User(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    posts = models.ManyToManyField(Post, related_name='tags')`,
};
