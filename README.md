# Daymark

A small Expo task planner built to demonstrate React Navigation. Tasks are stored in app state for the current session.

## Run the app

```sh
npm install
npx expo start
```

Open it in Expo Go or an Android/iOS simulator.

## Navigation structure

```text
Native Stack
├── Workspace (Drawer)
│   ├── My workspace (Bottom Tabs)
│   │   ├── Today
│   │   ├── My tasks
│   │   └── Your progress
│   └── About
├── Task details
└── New task
```

## Viva walkthrough

- Tap a task on Today or My tasks. The app navigates to Task details and passes the selected task in `route.params.task`; the details screen displays its title, category, due time, priority, and status.
- The Drawer header title changes with the selected tab. Task details and New task also have their own Stack header titles.
- Use the `+` button in the Workspace header to open New task. The task form adds a task to shared app state.
- On Task details, use Complete/Reopen in the header to update the task and see an alert. The updated status is reflected throughout the app.
- Open the drawer with the menu button to visit About, or use the bottom tabs to switch between Today, My tasks, and Your progress.
