
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const DB_KEY = 'nexora_v2_database';
const SESSION_KEY = 'nexora_v2_session';

const defaultLessons = [
  {
    id: 'l1',
    title: 'مقدمة في العلوم المتكاملة',
    subject: 'العلوم المتكاملة',
    description: 'ابدأ بفهم أساسيات المادة وكيفية الربط بين فروع العلوم.',
    duration: '18 دقيقة',
    icon: '⚗️',
    video: ''
  },
  {
    id: 'l2',
    title: 'الغلاف المائي وخصائصه',
    subject: 'العلوم المتكاملة',
    description: 'تعرف على الخصائص الفيزيائية والكيميائية للماء.',
    duration: '24 دقيقة',
    icon: '🌊',
    video: ''
  },
  {
    id: 'l3',
    title: 'أساسيات اللغة الإنجليزية',
    subject: 'اللغة الإنجليزية',
    description: 'مراجعة القواعد الأساسية وتكوين الجمل.',
    duration: '20 دقيقة',
    icon: '🔤',
    video: ''
  },
  {
    id: 'l4',
    title: 'مدخل إلى الرياضيات',
    subject: 'الرياضيات',
    description: 'تدرب على المفاهيم الرياضية وحل المسائل.',
    duration: '30 دقيقة',
    icon: '📐',
    video: ''
  },
  {
    id: 'l5',
    title: 'الحضارة المصرية القديمة',
    subject: 'التاريخ',
    description: 'جولة في عوامل قيام الحضارة المصرية القديمة.',
    duration: '22 دقيقة',
    icon: '🏺',
    video: ''
  }
];

const badgeCatalog = [
  { id: 'first', name: 'أول خطوة', icon: '🌱', desc: 'أكملت أول درس' },
  { id: 'five', name: 'المثابر', icon: '🔥', desc: 'أكملت 5 دروس' },
  { id: 'exam', name: 'بطل الاختبارات', icon: '🎯', desc: 'أنهيت أول اختبار' },
  { id: 'perfect', name: 'العلامة الكاملة', icon: '💎', desc: 'حققت 100% في اختبار' },
  { id: 'tasks', name: 'منظم', icon: '📅', desc: 'أنجزت 5 مهام' }
];

const exams = [
  {
    id: 'e1',
    title: 'اختبار العلوم المتكاملة',
    subject: 'العلوم المتكاملة',
    questions: [
      {
        q: 'ما النسبة التقريبية للماء على سطح الأرض؟',
        a: ['حوالي 71%', 'حوالي 30%', 'حوالي 10%'],
        correct: 0
      },
      {
        q: 'أي مما يلي يُعد من الخصائص الفيزيائية للماء؟',
        a: ['الملوحة', 'درجة الغليان', 'التركيب الكيميائي'],
        correct: 1
      },
      {
        q: 'ما الصيغة الكيميائية للماء؟',
        a: ['CO₂', 'O₂', 'H₂O'],
        correct: 2
      }
    ]
  },
  {
    id: 'e2',
    title: 'اختبار اللغة الإنجليزية',
    subject: 'اللغة الإنجليزية',
    questions: [
      {
        q: 'Choose the correct sentence:',
        a: ['She were studying.', 'She was studying.', 'She studying.'],
        correct: 1
      },
      {
        q: 'We use “did” with:',
        a: ['the base form of the verb', 'verb + ing', 'past participle'],
        correct: 0
      },
      {
        q: 'Choose the correct word: He is very ____; everyone trusts him.',
        a: ['reliable', 'isolated', 'overwhelmed'],
        correct: 0
      }
    ]
  },
  {
    id: 'e3',
    title: 'اختبار معلومات عامة',
    subject: 'معلومات عامة',
    questions: [
      {
        q: 'ما عاصمة مصر؟',
        a: ['الإسكندرية', 'القاهرة', 'أسوان'],
        correct: 1
      },
      {
        q: 'كم عدد أيام الأسبوع؟',
        a: ['5', '6', '7'],
        correct: 2
      }
    ]
  }
];

function loadDB() {
  try {
    const data = JSON.parse(localStorage.getItem(DB_KEY));

    if (data && Array.isArray(data.users)) {
      return {
        ...data,
        lessons: data.lessons || [...defaultLessons],
        notifications: data.notifications || []
      };
    }
  } catch (error) {
    console.error('Database loading error:', error);
  }

  return {
    users: [],
    lessons: [...defaultLessons],
    notifications: []
  };
}

let db = loadDB();
let currentUser = null;
let authMode = 'login';
let activeLesson = null;
let activeExam = null;

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function saveUser() {
  if (!currentUser) return;

  const index = db.users.findIndex(user => user.id === currentUser.id);

  if (index >= 0) {
    db.users[index] = currentUser;
  }

  saveDB();
}

function xpLevel(xp) {
  return Math.floor((xp || 0) / 100) + 1;
}

function levelProgress(xp) {
  return (xp || 0) % 100;
}

function notify(userId, title, message, icon = '🔔') {
  db.notifications.unshift({
    id: Date.now() + Math.random(),
    userId,
    title,
    message,
    icon,
    date: new Date().toLocaleString('ar-EG'),
    read: false
  });

  saveDB();
}

function toast(message) {
  const element = $('#toast');

  element.textContent = message;
  element.classList.add('show');

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    element.classList.remove('show');
  }, 2600);
}

function grantXP(amount, reason) {
  currentUser.xp = (currentUser.xp || 0) + amount;

  saveUser();

  notify(
    currentUser.id,
    'نقاط جديدة',
    `حصلت على ${amount} XP: ${reason}`,
    '⚡'
  );

  checkBadges();
  refreshUI();
  toast(`ممتاز! حصلت على ${amount} XP`);
}

function checkBadges() {
  const lessons = currentUser.completedLessons || [];
  const examsDone = currentUser.examResults || [];
  const tasks = (currentUser.tasks || []).filter(task => task.done).length;

  const earned = [];

  if (lessons.length >= 1) earned.push('first');
  if (lessons.length >= 5) earned.push('five');
  if (examsDone.length >= 1) earned.push('exam');
  if (examsDone.some(exam => exam.percent === 100)) earned.push('perfect');
  if (tasks >= 5) earned.push('tasks');

  currentUser.badges = currentUser.badges || [];

  earned.forEach(id => {
    if (!currentUser.badges.includes(id)) {
      currentUser.badges.push(id);

      const badge = badgeCatalog.find(item => item.id === id);

      if (badge) {
        notify(
          currentUser.id,
          'شارة جديدة!',
          `حصلت على شارة ${badge.name}`,
          '🏅'
        );
      }
    }
  });

  saveUser();
}

/* تسجيل الدخول وإنشاء الحساب داخل الموقع */

function setAuthMode(mode) {
  authMode = mode;

  $$('[data-auth-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.authTab === mode);
  });

  $('#nameField').classList.toggle('hidden', mode === 'login');
  $('#roleField').classList.toggle('hidden', mode === 'login');

  $('#authTitle').textContent =
    mode === 'login'
      ? 'مرحبًا بعودتك'
      : 'أنشئ حسابك في NEXORA';

  $('#authSubtitle').textContent =
    mode === 'login'
      ? 'سجّل دخولك وكمّل رحلتك التعليمية.'
      : 'ابدأ رحلتك التعليمية بخطوات بسيطة.';

  $('#authSubmit').innerHTML =
    mode === 'login'
      ? 'تسجيل الدخول <span>←</span>'
      : 'إنشاء الحساب <span>←</span>';

  $('#authMessage').textContent = '';

  $('#authPassword').autocomplete =
    mode === 'login' ? 'current-password' : 'new-password';

  $('#authName').required = mode === 'signup';
}

/* التبديل بين التسجيل والدخول */

$$('[data-auth-tab]').forEach(button => {
  button.addEventListener('click', () => {
    setAuthMode(button.dataset.authTab);
  });
});

/* معالجة نموذج الحساب */

$('#authForm').addEventListener('submit', event => {
  event.preventDefault();

  const email = $('#authEmail').value.trim().toLowerCase();
  const password = $('#authPassword').value;

  if (!email || !password) {
    $('#authMessage').textContent = 'اكتب البريد الإلكتروني وكلمة المرور.';
    return;
  }

  if (authMode === 'signup') {
    const name = $('#authName').value.trim();
    const role = $('#authRole').value;

    if (!name) {
      $('#authMessage').textContent = 'اكتب اسمك أولًا.';
      return;
    }

    if (password.length < 6) {
      $('#authMessage').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      return;
    }

    const existingUser = db.users.some(user => user.email === email);

    if (existingUser) {
      $('#authMessage').textContent =
        'البريد الإلكتروني مسجل بالفعل. سجّل الدخول.';
      return;
    }

    currentUser = {
      id: 'u' + Date.now(),
      name,
      email,
      password,
      role,
      xp: 0,
      completedLessons: [],
      examResults: [],
      tasks: [],
      badges: [],
      createdAt: Date.now()
    };

    db.users.push(currentUser);

    saveDB();

    localStorage.setItem(SESSION_KEY, currentUser.id);

    notify(
      currentUser.id,
      'أهلًا بك في NEXORA',
      'حسابك اتعمل بنجاح. ابدأ أول درس!',
      '👋'
    );

    enterApp();

    toast('تم إنشاء حسابك بنجاح!');
  } else {
    const user = db.users.find(
      item => item.email === email && item.password === password
    );

    if (!user) {
      $('#authMessage').textContent =
        'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      return;
    }

    currentUser = user;

    localStorage.setItem(SESSION_KEY, currentUser.id);

    enterApp();

    toast('تم تسجيل الدخول بنجاح!');
  }
});

/* فتح المنصة بعد تسجيل الدخول */

function enterApp() {
  $('#authScreen').classList.add('hidden');
  $('#appShell').classList.remove('hidden');

  refreshUI();
  showView('home');
}

/* تسجيل الخروج */

function logout() {
  localStorage.removeItem(SESSION_KEY);

  currentUser = null;

  $('#appShell').classList.add('hidden');
  $('#authScreen').classList.remove('hidden');

  $('#authForm').reset();

  setAuthMode('login');
}

$('#logoutBtn').addEventListener('click', logout);

/* التنقل بين الصفحات */

function showView(view) {
  if (view === 'admin' && currentUser.role !== 'teacher') {
    toast('هذه الصفحة متاحة لحساب المعلم فقط');
    return;
  }

  $$('.view').forEach(element => {
    element.classList.toggle('active', element.id === `view-${view}`);
  });

  $$('.nav-link[data-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  const titles = {
    home: 'الرئيسية',
    courses: 'الدروس والكورسات',
    exams: 'الاختبارات',
    planner: 'جدول المذاكرة',
    leaderboard: 'لوحة المتصدرين',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    admin: 'لوحة المعلم'
  };

  $('#pageTitle').textContent = titles[view] || 'NEXORA';

  $('#sidebar').classList.remove('open');

  if (view === 'admin') renderAdmin();
  if (view === 'leaderboard') renderLeaderboard();
  if (view === 'notifications') renderNotifications();
  if (view === 'planner') renderTasks();
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-view]');

  if (button) {
    event.preventDefault();
    showView(button.dataset.view);
  }
});

$('#menuToggle').addEventListener('click', () => {
  $('#sidebar').classList.toggle('open');
});

/* الوضع الليلي والنهاري */

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');

  localStorage.setItem(
    'nexora_theme',
    document.body.classList.contains('light') ? 'light' : 'dark'
  );
});

/* تحديث بيانات الواجهة */

function refreshUI() {
  if (!currentUser) return;

  const xp = currentUser.xp || 0;
  const level = xpLevel(xp);
  const progress = levelProgress(xp);

  const unread = db.notifications.filter(
    notification =>
      notification.userId === currentUser.id && !notification.read
  ).length;

  $('#topUserName').textContent = currentUser.name;
  $('#topUserRole').textContent =
    currentUser.role === 'teacher' ? 'معلم' : 'طالب';

  $('#topAvatar').textContent = currentUser.name[0] || 'N';

  $('#sideLevel').textContent = level;
  $('#sideXpBar').style.width = progress + '%';
  $('#sideXpText').textContent = `${progress} / 100 XP`;

  $('#heroXp').textContent = xp + ' XP';
  $('#heroLevel').textContent = 'المستوى ' + level;

  $('#statXp').textContent = xp;
  $('#statLevel').textContent = level;
  $('#statLessons').textContent =
    (currentUser.completedLessons || []).length;

  $('#statExams').textContent =
    (currentUser.examResults || []).length;

  $('#notificationCount').textContent = unread;
  $('#notificationCount').style.display =
    unread ? 'inline-block' : 'none';

  $('#topNotificationDot').style.display =
    unread ? 'block' : 'none';

  $$('.teacher-only').forEach(element => {
    element.classList.toggle(
      'hidden',
      currentUser.role !== 'teacher'
    );
  });

  renderHomeCourses();
  renderBadges();
  renderCourses();
  renderExams();
  renderTasks();
  renderProfile();
}

/* عرض الدروس في الرئيسية */

function renderHomeCourses() {
  const lessons = db.lessons.slice(0, 3);

  $('#homeCourses').innerHTML = lessons.map(lesson => `
    <div class="course-row">
      <div class="course-symbol">${lesson.icon || '📘'}</div>

      <div class="course-row-info">
        <b>${esc(lesson.title)}</b>
        <small>${esc(lesson.subject)} • ${esc(lesson.duration || 'درس')}</small>
      </div>

      <button data-open-lesson="${lesson.id}">ابدأ</button>
    </div>
  `).join('') || '<p class="empty-state">لا توجد دروس حاليًا.</p>';
}

/* عرض جميع الدروس */

function renderCourses() {
  $('#courseGrid').innerHTML = db.lessons.map(lesson => {
    const done = (currentUser.completedLessons || []).includes(lesson.id);

    return `
      <article class="course-card">
        <div class="course-symbol">${lesson.icon || '📘'}</div>

        <span class="eyebrow">${esc(lesson.subject)}</span>

        <h3>${esc(lesson.title)}</h3>

        <p>${esc(lesson.description || 'درس تعليمي على منصة NEXORA.')}</p>

        <div class="course-meta">
          <span>◷ ${esc(lesson.duration || 'درس')}</span>
          <span>${done ? '✓ مكتمل' : '20 XP عند الإكمال'}</span>
        </div>

        <button
          class="btn ${done ? 'ghost' : 'primary'}"
          data-open-lesson="${lesson.id}"
        >
          ${done ? 'مراجعة الدرس' : 'فتح الدرس'}
        </button>
      </article>
    `;
  }).join('');
}

/* فتح الدرس */

document.addEventListener('click', event => {
  const button = event.target.closest('[data-open-lesson]');

  if (button) {
    openLesson(button.dataset.openLesson);
  }
});

function openLesson(id) {
  activeLesson = db.lessons.find(lesson => lesson.id === id);

  if (!activeLesson) return;

  $('#lessonPlayer').classList.remove('hidden');
  $('#playerTitle').textContent = activeLesson.title;
  $('#playerDescription').textContent = activeLesson.description || '';

  $('#videoSource').src = activeLesson.video || '';

  const video = $('#lessonVideo');
  video.load();

  const completed = (currentUser.completedLessons || []).includes(id);

  $('#completeLesson').disabled = completed;

  $('#completeLesson').textContent = completed
    ? '✓ تم إكمال هذا الدرس'
    : '✓ علّم الدرس كمكتمل واحصل على 20 XP';

  $('#lessonPlayer').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

$('#closePlayer').addEventListener('click', () => {
  $('#lessonPlayer').classList.add('hidden');

  const video = $('#lessonVideo');
  video.pause();
});

/* إكمال الدرس */

$('#completeLesson').addEventListener('click', () => {
  if (!activeLesson) return;

  currentUser.completedLessons = currentUser.completedLessons || [];

  if (currentUser.completedLessons.includes(activeLesson.id)) return;

  currentUser.completedLessons.push(activeLesson.id);

  grantXP(20, 'إكمال درس ' + activeLesson.title);

  $('#completeLesson').disabled = true;
  $('#completeLesson').textContent = '✓ تم إكمال هذا الدرس';

  renderCourses();
});

/* الشارات */

function renderBadges() {
  const earned = currentUser.badges || [];

  $('#badgeCount').textContent = earned.length;

  const markup = badgeCatalog.map(badge => `
    <div
      class="badge-item ${earned.includes(badge.id) ? '' : 'locked'}"
      title="${esc(badge.desc)}"
    >
      ${badge.icon}
      <small>${esc(badge.name)}</small>
    </div>
  `).join('');

  $('#homeBadges').innerHTML = markup;
  $('#profileBadges').innerHTML = markup;
}

/* الاختبارات */

function renderExams() {
  $('#examList').innerHTML = exams.map(exam => `
    <article class="exam-card">
      <span class="eyebrow">${esc(exam.subject)}</span>
      <h3>${esc(exam.title)}</h3>
      <p>${exam.questions.length} أسئلة • تصحيح تلقائي ونتيجة فورية</p>
      <button class="btn primary" data-start-exam="${exam.id}">
        ابدأ الاختبار
      </button>
    </article>
  `).join('');
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-start-exam]');

  if (button) {
    startExam(button.dataset.startExam);
  }
});

function startExam(id) {
  activeExam = exams.find(exam => exam.id === id);

  if (!activeExam) return;

  $('#examArea').classList.remove('hidden');

  $('#examArea').innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">EXAM IN PROGRESS</p>
        <h3>${esc(activeExam.title)}</h3>
      </div>
      <span class="badge-count">${activeExam.questions.length} أسئلة</span>
    </div>

    <form id="examForm">
      ${activeExam.questions.map((question, index) => `
        <div class="question">
          <h4>${index + 1}. ${esc(question.q)}</h4>

          ${question.a.map((answer, answerIndex) => `
            <label class="option">
              <input
                type="radio"
                name="q${index}"
                value="${answerIndex}"
                required
              >
              ${esc(answer)}
            </label>
          `).join('')}
        </div>
      `).join('')}

      <button class="btn primary" type="submit">
        إنهاء وتصحيح الاختبار
      </button>
    </form>
  `;

  $('#examArea').scrollIntoView({ behavior: 'smooth' });

  $('#examForm').addEventListener('submit', finishExam);
}

function finishExam(event) {
  event.preventDefault();

  const data = new FormData(event.target);

  let score = 0;

  activeExam.questions.forEach((question, index) => {
    if (Number(data.get('q' + index)) === question.correct) {
      score++;
    }
  });

  const percent = Math.round(
    score / activeExam.questions.length * 100
  );

  currentUser.examResults = currentUser.examResults || [];

  currentUser.examResults.push({
    id: activeExam.id,
    percent,
    date: Date.now()
  });

  grantXP(score * 10 + 10, 'إنهاء ' + activeExam.title);

  checkBadges();

  $('#examArea').innerHTML = `
    <div class="exam-result">
      <p class="eyebrow">YOUR RESULT</p>
      <h3>خلصت الاختبار بنجاح!</h3>
      <strong>${percent}%</strong>

      <p class="muted">
        إجابات صحيحة: ${score} من ${activeExam.questions.length}
      </p>

      <p>
        ${
          percent >= 80
            ? 'أداء ممتاز! استمر 👏'
            : percent >= 50
              ? 'شغل كويس، راجع إجاباتك وحاول تاني.'
              : 'متقلقش، راجع الدرس وجرب مرة تانية.'
        }
      </p>

      <button class="btn primary" id="backExams">
        العودة للاختبارات
      </button>
    </div>
  `;

  $('#backExams').addEventListener('click', () => {
    $('#examArea').classList.add('hidden');
  });

  refreshUI();
}

/* جدول المذاكرة */

$('#taskDate').value = new Date().toISOString().slice(0, 10);

$('#taskForm').addEventListener('submit', event => {
  event.preventDefault();

  currentUser.tasks = currentUser.tasks || [];

  currentUser.tasks.push({
    id: Date.now(),
    title: $('#taskTitle').value.trim(),
    date: $('#taskDate').value,
    time: $('#taskTime').value,
    done: false
  });

  saveUser();

  event.target.reset();

  $('#taskDate').value = new Date().toISOString().slice(0, 10);

  renderTasks();

  toast('تمت إضافة المهمة');
});

function renderTasks() {
  if (!currentUser) return;

  const tasks = currentUser.tasks || [];

  $('#taskCount').textContent = tasks.filter(task => !task.done).length;

  $('#taskList').innerHTML = tasks.length
    ? tasks.slice().sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
      ).map(task => `
        <div class="task-item ${task.done ? 'done' : ''}">
          <input
            type="checkbox"
            data-task-done="${task.id}"
            ${task.done ? 'checked' : ''}
          >

          <div class="task-text">
            <b>${esc(task.title)}</b>
            <small>
              ${esc(task.date)}
              ${task.time ? '• ' + esc(task.time) : ''}
            </small>
          </div>

          <button
            class="delete-task"
            data-delete-task="${task.id}"
            title="حذف"
          >×</button>
        </div>
      `).join('')
    : '<div class="empty-state">لسه مفيش مهام. أضف أول مهمة ليك!</div>';
}

/* إنجاز المهام */

document.addEventListener('change', event => {
  const id = event.target.dataset.taskDone;

  if (!id) return;

  const task = (currentUser.tasks || []).find(
    item => String(item.id) === id
  );

  if (task && !task.done) {
    task.done = true;

    saveUser();

    grantXP(5, 'إنجاز مهمة مذاكرة');

    renderTasks();
  }
});

/* حذف المهام */

document.addEventListener('click', event => {
  const button = event.target.closest('[data-delete-task]');

  if (!button) return;

  currentUser.tasks = (currentUser.tasks || []).filter(
    task => String(task.id) !== button.dataset.deleteTask
  );

  saveUser();
  renderTasks();

  toast('تم حذف المهمة');
});

/* لوحة المتصدرين */

function renderLeaderboard() {
  const users = db.users.slice().sort(
    (a, b) => (b.xp || 0) - (a.xp || 0)
  );

  $('#leaderboardList').innerHTML = users.length
    ? users.map((user, index) => `
        <div class="leader-row">
          <span class="rank ${index < 3 ? 'top' : ''}">
            ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
          </span>

          <span class="leader-user">
            <span class="avatar">${esc((user.name || 'N')[0])}</span>
            <b>
              ${esc(user.name)}
              ${user.id === currentUser.id ? '(أنت)' : ''}
            </b>
          </span>

          <b>${user.xp || 0} XP</b>
        </div>
      `).join('')
    : '<p class="empty-state">لا توجد حسابات بعد.</p>';
}

/* الإشعارات */

function renderNotifications() {
  const list = db.notifications.filter(
    notification => notification.userId === currentUser.id
  );

  $('#notificationList').innerHTML = list.length
    ? list.map(notification => `
        <div class="notification ${notification.read ? '' : 'unread'}">
          <span class="notif-icon">${notification.icon || '🔔'}</span>

          <div>
            <b>${esc(notification.title)}</b>
            <small>
              ${esc(notification.message)} • ${esc(notification.date)}
            </small>
          </div>
        </div>
      `).join('')
    : '<p class="empty-state">لا توجد إشعارات حاليًا.</p>';
}

$('#markAllRead').addEventListener('click', () => {
  db.notifications.forEach(notification => {
    if (notification.userId === currentUser.id) {
      notification.read = true;
    }
  });

  saveDB();
  refreshUI();
  renderNotifications();
});

/* الملف الشخصي */

function renderProfile() {
  const user = currentUser;

  $('#profileAvatar').textContent = user.name[0] || 'N';
  $('#profileName').textContent = user.name;
  $('#profileEmail').textContent = user.email;

  $('#profileRole').textContent =
    user.role === 'teacher' ? 'معلم' : 'طالب';

  $('#profileXp').textContent = (user.xp || 0) + ' XP';

  $('#profileLevel').textContent =
    'المستوى ' + xpLevel(user.xp || 0);

  $('#profileProgress').style.width =
    levelProgress(user.xp || 0) + '%';

  $('#profileNameInput').value = user.name;
}

$('#profileForm').addEventListener('submit', event => {
  event.preventDefault();

  currentUser.name = $('#profileNameInput').value.trim();

  saveUser();
  refreshUI();

  toast('تم حفظ بيانات الملف الشخصي');
});

/* لوحة المعلم والإدارة */

$('#announcementForm').addEventListener('submit', event => {
  event.preventDefault();

  if (currentUser.role !== 'teacher') return;

  const message = $('#announcementText').value.trim();

  db.users
    .filter(user => user.role === 'student')
    .forEach(user => {
      notify(
        user.id,
        'إعلان من المعلم',
        message,
        '📢'
      );
    });

  saveDB();

  event.target.reset();

  toast('تم إرسال الإشعار للحسابات الطلابية على هذا الجهاز');
});

$('#newLessonForm').addEventListener('submit', event => {
  event.preventDefault();

  if (currentUser.role !== 'teacher') return;

  db.lessons.push({
    id: 'l' + Date.now(),
    title: $('#newLessonTitle').value.trim(),
    subject: $('#newLessonSubject').value.trim(),
    video: $('#newLessonVideo').value.trim(),
    description: 'درس تمت إضافته من لوحة المعلم.',
    duration: 'درس جديد',
    icon: '📘'
  });

  saveDB();

  event.target.reset();

  refreshUI();

  toast('تمت إضافة الدرس');
});

function renderAdmin() {
  if (currentUser.role !== 'teacher') return;

  $('#adminUsers').textContent = db.users.length;

  $('#adminTasks').textContent = db.users.reduce(
    (total, user) =>
      total + (user.tasks || []).filter(task => task.done).length,
    0
  );

  $('#adminUserList').innerHTML = db.users.map(user => `
    <div class="leader-row">
      <span>${user.role === 'teacher' ? '👨‍🏫' : '🎓'}</span>

      <span>
        ${esc(user.name)}
        <small class="muted"> • ${esc(user.email)}</small>
      </span>

      <b>${user.xp || 0} XP</b>
    </div>
  `).join('') || '<p class="empty-state">لا توجد حسابات.</p>';
}

/* حماية النصوص المعروضة */

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

/* الخلفية المتحركة */

function initParticles() {
  const canvas = $('#particles');
  const context = canvas.getContext('2d');

  let width;
  let height;
  let points = [];

  function resize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;

    points = Array.from(
      { length: Math.min(65, Math.floor(width / 20)) },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .35
      })
    );
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;

      context.fillStyle = 'rgba(135,145,255,.55)';
      context.fillRect(point.x, point.y, 2, 2);

      for (let j = i + 1; j < points.length; j++) {
        const other = points[j];
        const distance = Math.hypot(
          point.x - other.x,
          point.y - other.y
        );

        if (distance < 115) {
          context.strokeStyle =
            `rgba(117,139,230,${.12 * (1 - distance / 115)})`;

          context.lineWidth = .7;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();

  addEventListener('resize', resize);

  draw();
}

/* تشغيل المنصة */

if (localStorage.getItem('nexora_theme') === 'light') {
  document.body.classList.add('light');
}

initParticles();

const session = localStorage.getItem(SESSION_KEY);

if (session) {
  currentUser = db.users.find(user => user.id === session) || null;
}

if (currentUser) {
  enterApp();
} else {
  $('#authScreen').classList.remove('hidden');
  $('#appShell').classList.add('hidden');
  setAuthMode('login');
}
