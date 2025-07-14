// 全局变量
let currentScreen = 'install';
let screenId = 'BS-2024-001';
let clickCount = { topLeft: 0, topRight: 0 };
let clickTimer = { topLeft: null, topRight: null };
let cornerClickState = { 
    leftClicked: false, 
    rightClicked: false, 
    leftClickTime: 0,
    timeoutId: null 
};
let settings = {
    wifi: '',
    wifiPassword: '',
    autoStart: true,
    autoUpdate: false,
    brightness: 80,
    sleepTime: 0,
    timezone: 'Asia/Shanghai',
    language: 'zh-CN'
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 开始安装流程
    startInstallation();
    
    // 添加点击区域
    addClickAreas();
    
    // 初始化设置界面的事件监听
    initSettingsEvents();
    
    // 更新显示界面时间
    updateDisplayTime();
    setInterval(updateDisplayTime, 1000);
});

// 开始安装流程
function startInstallation() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const statusItems = document.querySelectorAll('.status-item');
    
    let progress = 0;
    const steps = [
        { text: '检查系统环境', duration: 1000 },
        { text: '下载应用文件', duration: 2000 },
        { text: '安装应用', duration: 1500 },
        { text: '配置应用', duration: 1000 },
        { text: '完成安装', duration: 500 }
    ];
    
    let currentStep = 0;
    
    function updateProgress() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progressText.textContent = step.text;
            
            // 更新进度条
            const targetProgress = ((currentStep + 1) / steps.length) * 100;
            const increment = (targetProgress - progress) / 20;
            
            const progressInterval = setInterval(() => {
                progress += increment;
                progressFill.style.width = progress + '%';
                
                if (progress >= targetProgress) {
                    clearInterval(progressInterval);
                    progress = targetProgress;
                    progressFill.style.width = progress + '%';
                    
                    // 更新状态项
                    if (currentStep < statusItems.length) {
                        statusItems[currentStep].classList.add('completed');
                        statusItems[currentStep].innerHTML = '✓ ' + step.text;
                    }
                    
                    currentStep++;
                    
                    if (currentStep < steps.length) {
                        setTimeout(updateProgress, 500);
                    } else {
                        // 安装完成，切换到绑定界面
                        setTimeout(() => {
                            switchScreen('bind');
                        }, 1000);
                    }
                }
            }, 50);
        }
    }
    
    updateProgress();
}

// 切换界面
function switchScreen(screenName) {
    // 隐藏所有界面
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 显示目标界面
    document.getElementById(screenName + '-screen').classList.add('active');
    currentScreen = screenName;
    
    // 重置点击计数和状态
    clickCount = { topLeft: 0, topRight: 0 };
    cornerClickState.leftClicked = false;
    cornerClickState.rightClicked = false;
    cornerClickState.leftClickTime = 0;
    if (cornerClickState.timeoutId) {
        clearTimeout(cornerClickState.timeoutId);
        cornerClickState.timeoutId = null;
    }
    
    // 更新显示界面的大屏ID
    if (screenName === 'display') {
        document.getElementById('display-screen-id').textContent = screenId;
    }
}

// 复制大屏ID
function copyScreenId() {
    navigator.clipboard.writeText(screenId).then(() => {
        alert('大屏ID已复制到剪贴板');
    }).catch(() => {
        // 备用方案
        const textArea = document.createElement('textarea');
        textArea.value = screenId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('大屏ID已复制到剪贴板');
    });
}

// 绑定设备
function bindDevice() {
    const bindCode = document.getElementById('bind-code').value;
    
    if (!bindCode) {
        alert('请输入验证码');
        return;
    }
    
    if (bindCode.length !== 6) {
        alert('验证码必须是6位数字');
        return;
    }
    
    // 模拟绑定过程
    const bindBtn = document.querySelector('.bind-btn');
    bindBtn.textContent = '绑定中...';
    bindBtn.disabled = true;
    
    setTimeout(() => {
        // 显示成功提示
        document.getElementById('success-modal').style.display = 'block';
    }, 1500);
}

// 关闭模态框
function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
    switchScreen('settings');
}

// 保存设置
function saveSettings() {
    // 获取所有设置值
    settings.wifi = document.getElementById('wifi-select').value;
    settings.wifiPassword = document.getElementById('wifi-password').value;
    settings.autoStart = document.getElementById('auto-start').checked;
    settings.autoUpdate = document.getElementById('auto-update').checked;
    settings.brightness = document.getElementById('brightness').value;
    settings.sleepTime = document.getElementById('sleep-time').value;
    settings.timezone = document.getElementById('timezone').value;
    settings.language = document.getElementById('language').value;
    
    // 保存到本地存储
    localStorage.setItem('screenSettings', JSON.stringify(settings));
    
    alert('设置已保存');
}

// 开始运行
function startDisplay() {
    switchScreen('display');
}

// 初始化设置界面事件
function initSettingsEvents() {
    // 亮度滑块
    const brightnessSlider = document.getElementById('brightness');
    const brightnessValue = document.getElementById('brightness-value');
    
    brightnessSlider.addEventListener('input', function() {
        brightnessValue.textContent = this.value + '%';
    });
    
    // 加载保存的设置
    loadSettings();
}

// 加载设置
function loadSettings() {
    const savedSettings = localStorage.getItem('screenSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        
        // 应用设置到界面
        document.getElementById('wifi-select').value = settings.wifi;
        document.getElementById('wifi-password').value = settings.wifiPassword;
        document.getElementById('auto-start').checked = settings.autoStart;
        document.getElementById('auto-update').checked = settings.autoUpdate;
        document.getElementById('brightness').value = settings.brightness;
        document.getElementById('brightness-value').textContent = settings.brightness + '%';
        document.getElementById('sleep-time').value = settings.sleepTime;
        document.getElementById('timezone').value = settings.timezone;
        document.getElementById('language').value = settings.language;
    }
}

// 添加点击区域
function addClickAreas() {
    // 左上角点击区域
    const topLeftArea = document.createElement('div');
    topLeftArea.className = 'click-area top-left';
    document.body.appendChild(topLeftArea);
    
    // 右上角点击区域
    const topRightArea = document.createElement('div');
    topRightArea.className = 'click-area top-right';
    document.body.appendChild(topRightArea);
    
    // 绑定点击事件
    topLeftArea.addEventListener('click', () => handleCornerClick('topLeft'));
    topRightArea.addEventListener('click', () => handleCornerClick('topRight'));
}

// 处理角落点击
function handleCornerClick(corner) {
    const now = Date.now();
    
    if (corner === 'topLeft') {
        // 左边点击
        clickCount.topLeft++;
        
        // 清除之前的定时器
        if (clickTimer.topLeft) {
            clearTimeout(clickTimer.topLeft);
        }
        
        // 设置新的定时器（只有在没有开始右边点击时才清零）
        if (!cornerClickState.leftClicked || clickCount.topRight === 0) {
            clickTimer.topLeft = setTimeout(() => {
                clickCount.topLeft = 0;
            }, 2000);
        }
        
        // 记录左边点击状态
        cornerClickState.leftClicked = true;
        cornerClickState.leftClickTime = now;
        
        // 清除之前的超时定时器
        if (cornerClickState.timeoutId) {
            clearTimeout(cornerClickState.timeoutId);
        }
        
        // 设置5秒超时
        cornerClickState.timeoutId = setTimeout(() => {
            // 5秒内没有右边点击，重置状态
            cornerClickState.leftClicked = false;
            cornerClickState.rightClicked = false;
            cornerClickState.leftClickTime = 0;
        }, 5000);
        

        
    } else if (corner === 'topRight') {
        // 右边点击
        clickCount.topRight++;
        
        // 清除之前的定时器
        if (clickTimer.topRight) {
            clearTimeout(clickTimer.topRight);
        }
        
        // 设置新的定时器
        clickTimer.topRight = setTimeout(() => {
            clickCount.topRight = 0;
        }, 2000);
        
        // 清除左边的自动清零定时器，因为已经开始右边点击
        if (cornerClickState.leftClicked && clickTimer.topLeft) {
            clearTimeout(clickTimer.topLeft);
        }
        
        // 检查是否在左边点击后5秒内开始点击右边
        if (cornerClickState.leftClicked && (now - cornerClickState.leftClickTime) <= 5000) {
            // 清除超时定时器，因为已经开始了右边点击
            if (cornerClickState.timeoutId) {
                clearTimeout(cornerClickState.timeoutId);
                cornerClickState.timeoutId = null;
            }
            
            // 检查点击次数并执行相应操作
            if (currentScreen === 'display') {
                // 运行界面：需要左边4下+右边4下进入设置
                if (clickCount.topLeft >= 4 && clickCount.topRight >= 4) {
                    switchScreen('settings');
                    // 重置计数和状态
                    clickCount.topLeft = 0;
                    clickCount.topRight = 0;
                    cornerClickState.leftClicked = false;
                    cornerClickState.rightClicked = false;
                    cornerClickState.leftClickTime = 0;
                }
            } else if (currentScreen === 'settings') {
                // 设置界面：需要左边8下+右边8下退出应用
                if (clickCount.topLeft >= 8 && clickCount.topRight >= 8) {
                    exitApp();
                    // 重置计数和状态
                    clickCount.topLeft = 0;
                    clickCount.topRight = 0;
                    cornerClickState.leftClicked = false;
                    cornerClickState.rightClicked = false;
                    cornerClickState.leftClickTime = 0;
                }
            }
        } else {
            // 没有先点击左边或超时，重置状态
            cornerClickState.leftClicked = false;
            cornerClickState.rightClicked = false;
            cornerClickState.leftClickTime = 0;
        }
    }
}

// 退出应用
function exitApp() {
    if (confirm('确定要退出大屏应用吗？')) {
        // 模拟退出应用
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #2c3e50;
                color: white;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                font-size: 2rem;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">👋</div>
                    <div>大屏应用已退出</div>
                    <div style="font-size: 1rem; margin-top: 1rem; opacity: 0.7;">
                        刷新页面重新启动
                    </div>
                </div>
            </div>
        `;
    }
}

// 更新显示界面时间
function updateDisplayTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const timeDisplay = document.getElementById('current-time');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

// 生成随机大屏ID
function generateScreenId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    screenId = `BS-2024-${timestamp}${random}`;
    document.getElementById('screen-id').textContent = screenId;
}

// 页面加载时生成大屏ID
window.addEventListener('load', generateScreenId); 