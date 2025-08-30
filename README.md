# PureLeaf - Tea Factory Mobile App

A mobile application for the PureLeaf Tea Factory Management System, built with React Native and Expo. This app empowers suppliers, drivers, and estate managers to interact with the factory system on the go, providing real-time updates, supply chain tracking, and operational tools.

---

## 📱 Features

- Role-based access for suppliers, drivers, and estate managers  
- Real-time supply chain and shipment tracking  
- Notifications and alerts for critical events  
- Mobile-friendly dashboards and reporting  
- Seamless integration with backend APIs  

---

## 🛠️ Technology Stack

- React Native  
- Expo  
- JavaScript / TypeScript  
- Axios (for API requests)  
- React Navigation  

---

## 📦 Project Structure
```
tea-factory-mobile-app/
├── pureleaf/
   ├── app/             # Main application source code
   ├── assets/          # Images, icons, fonts, and other static resources
   ├── components/      # Reusable React Native UI components
   ├── constants/       # App-wide constants (e.g., colors, strings, config)
   ├── hooks/
   ├── scripts/
   ├── .env.example     # Example environment variable file for configuration
   ├── .gitignore
   ├── app.config.js
   ├── app.json  
   ├── eslint.config.js
   ├── firebase.js 
   ├── package-lock.json
   ├── package.json
   ├── tsconfig.json
├── README.md

```

---

## ⚡ Getting Started

### Clone the repository

```
git clone https://github.com/3rd-year-project-14/tea-factory-mobile-app.git
cd tea-factory-mobile-app
cd pureleaf
```

### Install dependencies

```
npm install
```
### Create .env file in the pureleaf folder

Inside .env update your base url
```
BASE_URL = your_base_url
```


### Start the Expo development server

```
npx expo start
```

### Run the app

- Use the Expo Go app on your mobile device  
- Open in an Android/iOS emulator  
- Or open in your web browser  

---

## 🔧 Configuration

- To use environment variables (e.g., API URLs), create a `.env` file in the root directory.  
- Update API endpoints and keys as needed for your backend integration.

---

## 🤝 Contributing

- Fork the repository and create a feature branch.  
- Follow code style and best practices.  
- Write clear commit messages and update documentation as needed.  
- Submit pull requests for review.

---

## 📢 Notes

- For backend/API setup, refer to the [PureLeaf Backend Repository](https://github.com/3rd-year-project-14/tea-factory-backend).  
- For web frontend features, see the [PureLeaf Frontend Web Repository](https://github.com/3rd-year-project-14/tea-factory-frontend-web).  

© 2025 3rd-year-project-14 Organization. All rights reserved.

