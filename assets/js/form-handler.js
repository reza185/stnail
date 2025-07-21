// تنظیمات اولیه
document.addEventListener('DOMContentLoaded', function() {
  // تنظیم تاریخ امروز
  document.getElementById('date').value = formatPersianDate(new Date());
  
  // رویداد تغییر روز
  document.getElementById('day').addEventListener('change', updateTimes);
  
  // رویداد ارسال فرم
  document.getElementById('reservationForm').addEventListener('submit', handleFormSubmit);
});

// تابع فرمت تاریخ به فارسی
function formatPersianDate(date) {
  const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'persian'
  };
  return date.toLocaleDateString('fa-IR', options);
}

// تابع به‌روزرسانی زمان‌ها
function updateTimes() {
  const day = document.getElementById('day').value;
  const timeSelect = document.getElementById('time');
  
  timeSelect.innerHTML = '';
  
  if (!day) {
      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="">-- ابتدا روز را انتخاب کنید --</option>';
      return;
  }
  
  const times = getAvailableTimes(day);
  
  if (times.length === 0) {
      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="">هیچ زمانی برای این روز تعریف نشده</option>';
      return;
  }
  
  timeSelect.disabled = false;
  timeSelect.innerHTML = '<option value="">-- انتخاب زمان --</option>';
  
  times.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
  });
}

// زمان‌های موجود برای هر روز
function getAvailableTimes(day) {
  const timesMap = {
      'شنبه': ['۹ صبح', '۱۱ صبح', '۳ بعد ازظهر', '۵ بعدازظهر'],
      'یکشنبه': ['۹ صبح', '۱۱ صبح', '۳ بعد ازظهر', '۵ بعدازظهر'],
      'دوشنبه': ['۹ صبح', '۱۱ صبح', '۳ بعد ازظهر', '۵ بعدازظهر'],
      'سه شنبه': ['۹ صبح', '۱۱ صبح', '۳ بعد ازظهر', '۵ بعدازظهر'],
      'چهارشنبه': ['۴ بعد ازظهر', '۶ بعدازظهر'],
      'پنجشنبه': ['۹ صبح', '۱۱ صبح']
  };
  return timesMap[day] || [];
}

// تابع ارسال فرم
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = {};
  
  formData.forEach((value, key) => {
      data[key] = value;
  });
  
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.classList.add('hidden');
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'در حال ثبت...';
  
  sendReservation(data)
      .then(response => {
          showMessage('success', نوبت با موفقیت ثبت شد!<br>
              نام: ${data.name}<br>
              نام خانوادگی: ${data.family}<br>
              شماره تماس: ${data.phone}<br>
              روز: ${data.day}<br>
              زمان: ${data.time}<br>
              تاریخ: ${data.date});
          
          form.reset();
          document.getElementById('date').value = formatPersianDate(new Date());
      })
      .catch(error => {
          showMessage('error', error.message || 'خطا در ثبت نوبت');
      })
      .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'ثبت نوبت';
      });
}

// تابع ارسال داده به سرور
function sendReservation(data) {
  return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'YOUR_GOOGLE_SCRIPT_URL');
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
          if (xhr.status === 200) {
              try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.result === 'success') {
resolve(response);
                  } else {
                      reject(new Error(response.message));
                  }
              } catch (e) {
                  reject(new Error('پاسخ سرور نامعتبر است'));
              }
          } else {
              reject(new Error(خطای سرور: ${xhr.status}));
          }
      };
      
      xhr.onerror = function() {
          reject(new Error('اتصال به سرور برقرار نشد'));
      };
      
      xhr.send(JSON.stringify(data));
  });
}

// تابع نمایش پیام
function showMessage(type, text) {
  const messageDiv = document.getElementById('messageContainer');
  messageDiv.innerHTML = text;
  messageDiv.className = message ${type}-message;
  messageDiv.classList.remove('hidden');
  
  setTimeout(() => {
      messageDiv.classList.add('hidden');
  }, 5000);
}