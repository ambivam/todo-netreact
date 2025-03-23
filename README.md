# Todo Application

A full-stack Todo application built with React, C#.NET, and SQLite.

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Add descriptions to todos
- Real-time updates
- Modern and responsive UI
- SQLite database for data persistence

## Prerequisites

- [.NET 7.0 SDK](https://dotnet.microsoft.com/download/dotnet/7.0) or later
- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Project Structure

```
.
├── TodoApi/                 # Backend API
│   ├── Controllers/        # API Controllers
│   ├── Data/              # Database Context
│   ├── Models/            # Data Models
│   └── Program.cs         # Application Entry Point
└── todo-client/           # Frontend React App
    ├── src/
    │   ├── components/    # React Components
    │   ├── App.js         # Main App Component
    │   └── App.css        # Styles
    └── package.json       # Frontend Dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to the TodoApi directory:
   ```bash
   cd TodoApi
   ```

2. Install required NuGet packages:
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore.Sqlite
   dotnet add package Microsoft.EntityFrameworkCore.Design
   dotnet add package Swashbuckle.AspNetCore
   ```

3. Install the Entity Framework Core tools globally:
   ```bash
   dotnet tool install --global dotnet-ef
   ```
   If you already have it installed but need to update, use:
   ```bash
   dotnet tool update --global dotnet-ef
   ```

4. Create the initial database migration:
   ```bash
   dotnet ef migrations add InitialCreate
   ```

5. Apply the migration to create the database:
   ```bash
   dotnet ef database update
   ```

6. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at:
- HTTP: http://localhost:5081
- Swagger UI: http://localhost:5081/swagger

Note: You might see a warning about "Failed to determine the https port for redirect". This is normal in development mode and won't affect the functionality of the application.

### Frontend Setup

1. Navigate to the todo-client directory:
   ```bash
   cd todo-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The React app will be available at: http://localhost:3000

## API Endpoints

- `GET /api/Todo` - Get all todos
- `GET /api/Todo/{id}` - Get a specific todo
- `POST /api/Todo` - Create a new todo
- `PUT /api/Todo/{id}` - Update a todo
- `DELETE /api/Todo/{id}` - Delete a todo

## Database

The application uses SQLite as its database. The database file (`Todo.db`) will be created automatically when you run the migrations.

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**
   - Make sure the backend is running (should show "Now listening on: http://localhost:5081")
   - Check if you can access the Swagger UI at http://localhost:5081/swagger
   - Verify that no other application is using port 5081
   - If you get "dotnet-ef does not exist" error:
     - Install EF Core tools using: `dotnet tool install --global dotnet-ef`
     - Make sure you're in the correct directory (TodoApi)
     - Try running the command with the full path: `dotnet ef migrations add InitialCreate`
   - If Swagger UI is not accessible:
     - Make sure you're in Development environment
     - Check if Swashbuckle.AspNetCore package is installed
     - Try accessing the raw Swagger JSON at http://localhost:5081/swagger/v1/swagger.json
     - Clear your browser cache and try again
   - If you see "Failed to determine the https port for redirect" warning:
     - This is normal in development mode
     - The application will still work with HTTP
     - If you want to remove the warning, you can set the environment to Development:
       ```bash
       set ASPNETCORE_ENVIRONMENT=Development
       ```

2. **Database Issues**
   - Make sure you've run the migrations
   - Check the connection string in `appsettings.json`
   - Verify the database file has proper permissions
   - If you get database errors, try:
     ```bash
     dotnet ef database drop --force
     dotnet ef database update
     ```

3. **Frontend Connection Issues**
   - Ensure both servers are running
   - Check the API URL in App.js (should be http://localhost:5081/api/Todo)
   - Open browser developer tools (F12) and check the Console tab for errors
   - If you get CORS errors:
     - Make sure the backend is running
     - Check that the CORS policy in Program.cs is properly configured
     - Try clearing your browser cache

4. **React Development Issues**
   - If you get "npm not found" error:
     - Make sure Node.js is installed
     - Try running `npm install -g npm` to update npm
   - If you get dependency errors:
     - Delete the node_modules folder and package-lock.json
     - Run `npm install` again
   - If the React app doesn't start:
     - Check if port 3000 is already in use
     - Try using a different port: `PORT=3001 npm start`

### Development Tips

1. **Backend Development**
   - Use Swagger UI to test API endpoints
   - Check the logs in the console for detailed error messages
   - Use Entity Framework migrations for database changes
   - If you make changes to the database:
     ```bash
     dotnet ef migrations add MigrationName
     dotnet ef database update
     ```
   - To verify Swagger is working:
     - Check if the environment is set to Development
     - Verify the Swagger configuration in Program.cs
     - Try accessing the raw Swagger JSON endpoint

2. **Frontend Development**
   - Use browser developer tools to debug API calls
   - Check the console for any JavaScript errors
   - Use React Developer Tools for component debugging
   - If you make changes to the API URL:
     - Update the API_URL constant in App.js
     - Restart the React development server

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 