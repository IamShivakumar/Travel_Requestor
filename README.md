# Travel Request Management System 
### Overview
This is a Travel Request Management System built using Python Django and React.js. The system provides separate user and admin flows to manage travel requests efficiently.
### Technology Used
- **Backend:** Python Django with Django REST Framework (DRF)
- **Authentication:** JWT-based authentication
- **Database:** PostgreSQL
- **Frontend:** React.js
### Features
### User Flow
- User registration and login using JWT authentication.
- Submit a travel request through a simple form.
- View all submitted travel requests in a table.
- Track the status of each travel request (Pending, Approved, Rejected).
### Admin Flow
- View all travel requests in a table.
- Access a detailed view of each travel request.
- Approve or reject travel requests.
- Status updates are reflected on both the admin and user pages.

### Installation
Follow these steps to set up and run the project.
### Backend Setup
1. Clone the Repository :
 ```
      git clone https://github.com/IamShivakumar/Travel_Requestor.git
      cd your-repo/backend
```
2. Create and Activate a Virtual Environment:
```
pip install pipenv
pipenv shell

```
3.Install the dependencies:
```
pipenv install

```
4.Configure Environment Variables:
Create a .env file in the backend directory and add your database credentials and JWT secret keys.

5. Apply Migrations:
```
python manage.py makemigrations
python manage.py migrate
```
6. Create Superuser (for Admin Access):
```
python manage.py createsuperuser
```
7. Run the Server:
```
python manage.py runserver
```
### Frontend Setup
1. Navigate to the frontend directory:
 ```
      cd ../frontend
```
2. Install dependencies:
```
npm install
```
3.Start the frontend server:
```
npm run dev

```
### API EndPoints
### Authentication
- POST /api/signup/ - Register a new user
- POST /api/login/ - Login and generate JWT tokens

### Travel Requests

- GET /api/travel-requests/ - List all travel requests (Admin can view all, users can view their own)
- POST /api/travel-requests/ - Create a new travel request
- GET /api/travel-requests/{id}/ - Retrieve details of a specific travel request
- PATCH /api/travel-requests/{id}/ - Update the status of a travel request (Admin only)

### Permissions
- Users can create travel requests and view their own requests.
- Admins can view, approve, or reject any travel request.

### Conclusion
This project provides a complete Travel Request Management solution with efficient admin controls and user-
friendly interfaces. Feel free to customize and expand based on your needs.

