const pm2 = require('pm2');

const MONITOR_INTERVAL = 60 * 1000; // 1 分钟

// 从命令行获取需要监控的 PM2 任务 ID
const monitoredIds = process.argv.slice(2).map(id => parseInt(id, 10));

// 检查是否传入了 PM2 任务 ID
if (monitoredIds.length === 0) {
    console.error('Please provide at least one PM2 process ID to monitor.');
    process.exit(1);
}

// 存储最后一次日志时间的对象
const lastLogTimes = {};

// 连接到 PM2
pm2.connect(function (err) {
    if (err) {
        console.error('Error connecting to PM2', err);
        process.exit(2);
    }

    console.log('Connected to PM2');

    // 初始化最后一次日志时间
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

        // 监控日志输出
        pm2.launchBus((err, bus) => {
            if (err) {
                console.error('Error launching PM2 bus', err);
                process.exit(2);
            }

            bus.on('log:out', data => {
                if (monitoredIds.includes(data.process.pm_id)) {
                    lastLogTimes[data.process.pm_id] = Date.now();
                    console.log(`Log output detected from app ID: ${data.process.pm_id}, name: ${data.process.name}`);
                }
            });

            // 定时检查日志时间
            setInterval(() => {
                const now = Date.now();

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
            }, MONITOR_INTERVAL);
        });
    });
});
