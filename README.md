# InstiForum

InstiForum is a web application designed to facilitate discussions and information sharing within an institute community. This README provides an overview of the project, setup instructions, and a detailed explanation of the code structure.

## Features

- User authentication (login/signup)
- Create, view, and reply to discussion threads
- Categorize threads by topics
- Search and filter discussions
- Responsive UI for desktop and mobile

## Technologies Used

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/instiforum.git
    cd instiforum
    ```
2. Install dependencies:
    ```bash
    npm install
    cd client
    npm install
    ```
3. Set up environment variables:
    - Create a `.env` file in the root directory with your MongoDB URI and JWT secret.

4. Start the development servers:
    ```bash
    npm run dev
    cd client
    npm start
    ```

## Code Structure

### Backend (`/server`)

- **server.js**: Entry point, sets up Express app, connects to MongoDB, and configures middleware.
- **models/**: Mongoose schemas for `User`, `Thread`, and `Reply`.
- **routes/**: API endpoints for authentication (`auth.js`), threads (`threads.js`), and replies (`replies.js`).
- **middleware/**: JWT authentication middleware.

#### Example: Thread Model

```js
const ThreadSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  createdAt: { type: Date, default: Date.now }
});
```

### Frontend (`/client`)

- **src/App.js**: Main React component, sets up routing.
- **src/components/**: Reusable UI components (Navbar, ThreadList, ThreadForm, ReplyForm).
- **src/pages/**: Page components (Home, ThreadDetail, Login, Signup).
- **src/context/**: Context providers for authentication and thread state.
- **src/services/**: API calls to backend.

#### Example: Creating a Thread

```js
// src/services/threadService.js
export async function createThread(data, token) {
  return fetch('/api/threads', {
     method: 'POST',
     headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify(data)
  });
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or feedback, open an issue or contact the maintainer.
