let loadingInterval;

document.getElementById('startTest').addEventListener('click', function () {
    startLoadingAnimation();
    measureSpeed();
});

function startLoadingAnimation() {
    const speedElements = document.querySelectorAll('#downloadSpeed, #uploadSpeed');
    let dots = 0;
    speedElements.forEach(el => el.textContent = 'Midiendo');

    loadingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        const loadingText = 'Midiendo' + '.'.repeat(dots);
        speedElements.forEach(el => {
            if (el.textContent.startsWith('Midiendo')) {
                el.textContent = loadingText;
            }
        });
    }, 500);
}

function stopLoadingAnimation() {
    clearInterval(loadingInterval);
}

async function measureSpeed() {
    await measureDownloadSpeed();
    await measureUploadSpeed();
    stopLoadingAnimation();
}

async function measureDownloadSpeed() {
    const testDuration = 10000; 
    const downloadUrl = 'https://speed.cloudflare.com/__down?bytes=100000000'; 
    let totalBytesDownloaded = 0;
    const startTime = Date.now();

    console.log('Starting download test...');
    document.getElementById('downloadSpeed').textContent = 'Midiendo';

    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reader = response.body.getReader();

        while (Date.now() - startTime < testDuration) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytesDownloaded += value.length;
            console.log(`Downloaded ${totalBytesDownloaded} bytes`);
        }

        reader.cancel();

        const elapsedTime = (Date.now() - startTime) / 1000; 
        const downloadSpeed = ((totalBytesDownloaded * 8) / elapsedTime / 1000000).toFixed(2);
        console.log(`Download completed. Total bytes: ${totalBytesDownloaded}, Time: ${elapsedTime}s, Speed: ${downloadSpeed} Mbps`);
        document.getElementById('downloadSpeed').textContent = downloadSpeed;
    } catch (error) {
        console.error('Error in download test:', error);
        document.getElementById('downloadSpeed').textContent = 'Error';
    }
}

async function measureUploadSpeed() {
    const testDuration = 10000; 
    const uploadUrl = 'https://speed.cloudflare.com/__up';
    const chunkSize = 200000;
    let totalBytesUploaded = 0;
    const startTime = Date.now();

    console.log('Starting upload test...');
    document.getElementById('uploadSpeed').textContent = 'Midiendo';

    try {
        while (Date.now() - startTime < testDuration) {
            const chunk = new ArrayBuffer(chunkSize);
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: chunk
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            totalBytesUploaded += chunkSize;
            console.log(`Uploaded ${totalBytesUploaded} bytes`);
        }

        const elapsedTime = (Date.now() - startTime) / 1000; 
        const uploadSpeed = ((totalBytesUploaded * 8) / elapsedTime / 1000000).toFixed(2);
        console.log(`Upload completed. Total bytes: ${totalBytesUploaded}, Time: ${elapsedTime}s, Speed: ${uploadSpeed} Mbps`);
        document.getElementById('uploadSpeed').textContent = uploadSpeed;
    } catch (error) {
        console.error('Error in upload test:', error);
        document.getElementById('uploadSpeed').textContent = 'Error';
    }
}