@echo off
echo Starting Todo Application Setup...

REM Store the root directory
set ROOT_DIR=%CD%

echo.
echo Step 1: Cleaning previous build...
cd TodoApi
if not exist TodoApi.csproj (
    echo Error: TodoApi.csproj not found!
    goto :error
)
dotnet clean
if errorlevel 1 goto :error

echo.
echo Step 2: Removing bin and obj folders...
if exist bin\ (
    rmdir /s /q bin
)
if exist obj\ (
    rmdir /s /q obj
)

echo.
echo Step 3: Restoring NuGet packages...
dotnet restore --force
if errorlevel 1 goto :error

echo.
echo Step 4: Building the application...
dotnet build
if errorlevel 1 goto :error

echo.
echo Step 5: Checking database status...
if exist Todo.db (
    echo Existing database found. Removing old database...
    del /f /q Todo.db
)

echo.
echo Step 6: Checking migrations...
if exist Migrations\ (
    echo Existing migrations found. Removing old migrations...
    rmdir /s /q Migrations
)

echo.
echo Step 7: Creating new migration...
dotnet ef migrations add InitialCreate
if errorlevel 1 goto :error

echo.
echo Step 8: Creating new database...
dotnet ef database update
if errorlevel 1 goto :error

echo.
echo Step 9: Starting the API (in a new window)...
start cmd /k "dotnet run --urls=http://localhost:5081"
if errorlevel 1 goto :error

echo.
echo Step 10: Cleaning and installing npm packages for the client...
cd %ROOT_DIR%\todo-client
if not exist package.json (
    echo Error: package.json not found!
    goto :error
)
if exist node_modules\ (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f /q package-lock.json
)
echo Installing npm packages...
call npm cache clean --force
call npm install --force
if errorlevel 1 (
    echo Retrying npm install with legacy peer deps...
    call npm install --legacy-peer-deps
    if errorlevel 1 goto :error
)

echo.
echo Step 11: Starting the React client (in a new window)...
start cmd /k "npm start"

echo.
echo Setup complete! The application should now be running at:
echo API: http://localhost:5081
echo Client: http://localhost:3000
echo Swagger UI: http://localhost:5081/swagger
echo.
echo If you see a blank screen or errors, please try the following:
echo 1. Check if both API and client windows are running
echo 2. Open browser developer tools (F12) and check for errors
echo 3. Ensure the API is running by visiting http://localhost:5081/swagger
echo 4. Try clearing your browser cache and refreshing
echo 5. If needed, manually run 'npm start' in the todo-client directory
echo.
echo Press any key to exit...
goto :end

:error
echo.
echo An error occurred during setup!
echo Please check the error messages above.
cd %ROOT_DIR%
pause
exit /b 1

:end
cd %ROOT_DIR%
pause 