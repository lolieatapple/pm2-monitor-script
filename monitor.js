const pm2 = require('pm2');

const MONITOR_INTERVAL = 60 * 1000; // 1 minute

// Get PM2 process IDs to monitor from command line arguments
const monitoredIds = process.argv.slice(2).map(id => parseInt(id, 10));

// Check if any PM2 process IDs were provided
if (monitoredIds.length === 0) {
    console.error('Please provide at least one PM2 process ID to monitor.');
    process.exit(1);
}

// Object to store the last log time for each monitored process
const lastLogTimes = {};

// Connect to PM2
pm2.connect(function (err) {
    if (err) {
        console.error('Error connecting to PM2', err);
        process.exit(2);
    }

    console.log('Connected to PM2');

    // Initialize the last log times for monitored processes
    pm2.list((err, list) => {
        if (err) {
            console.error('Error getting PM2 list', err);
            process.exit(2);
        }

        list.forEach(app => {
            if (monitoredIds.includes(app.pm_id)) {
                lastLogTimes[app.pm_id] = Date.now();
                console.log(`Monitoring app ID: ${app.pm_id}, name: ${app.name}`);
            }
        });

        // Monitor log output
        pm2.launchBus((err, bus) => {
            if (err) {
                console.error('Error launching PM2 bus', err);
                process.exit(2);
            }

            bus.on('log:out', data => {
                if (monitoredIds.includes(data.process.pm_id)) {
                    lastLogTimes[data.process.pm_id] = Date.now();
                    // console.log(`Log output detected from app ID: ${data.process.pm_id}, name: ${data.process.name}`);
                }
            });

            // Periodically check the log times
            setInterval(() => {
                const now = Date.now();
                console.log('Checking log times...');
                for (const pm_id in lastLogTimes) {
                    if (now - lastLogTimes[pm_id] > MONITOR_INTERVAL) {
                        console.log(`App ID: ${pm_id} has no log output for over 1 minute. Restarting...`);
                        pm2.restart(pm_id, (err) => {
                            if (err) {
                                console.error(`Error restarting app ID: ${pm_id}`, err);
                            } else {
                                console.log(`App ID: ${pm_id} restarted successfully`);
                                lastLogTimes[pm_id] = Date.now();
                            }
                        });
                    }
                }
                console.log('Checked log times...', lastLogTimes);
            }, MONITOR_INTERVAL);
        });
    });
});
