# Learning Platform Frontend

## Features

- 🎨 Modern and responsive user interface
- 🔐 JWT-based authentication system
- 📚 Course management and video lessons
- 🤖 AI-powered chatbot assistant
- 📊 Learning progress visualization
- 👤 User profile management

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```env
VITE_API_URL=http://localhost:3000
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── layout/        # Layout components
│   └── chat/          # Chatbot components
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── courses/       # Course-related pages
│   ├── dashboard/     # Dashboard pages
│   └── profile/       # Profile pages
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## Technologies Used

- React.js
- TypeScript
- Material-UI
- React Router
- Chart.js
- Axios
- JWT Authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

