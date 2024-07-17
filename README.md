# PM2 Monitor Script

This script monitors specified PM2 processes and automatically restarts them if they have no log output for over 1 minute. This ensures that your critical applications remain running and responsive.

## Features

- Monitors specified PM2 processes for log output activity.
- Automatically restarts processes if no log output is detected for over 1 minute.
- Logs monitoring activities and process restarts for easy debugging and tracking.

## Usage

### Prerequisites

- Node.js and npm installed on your machine.
- PM2 installed globally. You can install PM2 using npm:
  ```sh
  npm install -g pm2
  ```

### Installation

1. Clone this repository or download the `monitor.js` script to your local machine.
2. Navigate to the directory containing `monitor.js`.

### Running the Script

To start monitoring PM2 processes, use the following command:

```sh
pm2 start monitor.js --name monitor-script -- <process_id_1> <process_id_2> ...
```

Replace `<process_id_1>`, `<process_id_2>`, etc., with the actual PM2 process IDs you want to monitor.

Example:

```sh
pm2 start monitor.js --name monitor-script -- 1 2 3
```

This command starts the monitor script and sets it to monitor PM2 processes with IDs 1, 2, and 3.

### Script Output

The script provides informative logs about its activity, including:

- Successful connection to PM2.
- The PM2 process IDs and names being monitored.
- Detection of log output from monitored processes.
- Automatic restarts of processes that have no log output for over 1 minute.

## Testing

To test the functionality of the monitor script:

1. Ensure you have at least one PM2 process running. You can start a simple Node.js app using PM2 for testing:
   ```sh
   pm2 start <your_app.js> --name test-app
   ```

2. Start the monitor script and include the PM2 process ID of the running app:
   ```sh
   pm2 start monitor.js --name monitor-script -- <test_app_id>
   ```

3. Stop the log output of the test app to simulate inactivity. You can edit the test app to stop logging or simply stop it temporarily.
   ```sh
   pm2 stop <test_app_id>
   ```

4. Observe the monitor script's logs to see if it detects the inactivity and restarts the test app.

## Contributing

If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

By using this script, you can ensure that your PM2-managed applications remain active and responsive, minimizing downtime and maintaining smooth operations.

