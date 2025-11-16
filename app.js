// app.js — complete functionality with localStorage
// Author: ChatGPT (HTML + CSS + Javascript GPT)
// Behavior: registration/login, student dashboard, admin panel, videos from Drive, payment upload (proof), store everything in localStorage.

const STORAGE_KEYS = {
      USERS: "dl_users_v1",
        SESS: "dl_session_v1",
          CONTENT: "dl_content_v1" // holds videos, pdfs, tasks, payments
};

// Default class plans & fees (assumption from conversation)
const CLASS_PLANS = [
      { id: "LKG", label: "LKG", fee: 25 },
        { id: "UKG", label: "UKG", fee: 100 },
          { id: "1-2", label: "1st - 2nd", fee: 150 },
            { id: "3-4", label: "3rd - 4th", fee: 200 },
              { id: "5", label: "5th", fee: 250 }
];

// default admin credentials
const ADMIN_CREDENTIALS = { email: "admin@admin.com", pass: "admin123" };

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

// Simple storage helpers
function read(key, fallback = null){
      const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
}
function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// Initialize content store with sample videos and pdfs if empty
function ensureInitialContent(){
      let c = read(STORAGE_KEYS.CONTENT);
        if (!c) {
                c = {
                          videos: [
                                    // sample placeholder Drive preview links — replace with your actual Drive file IDs
                                            { id: genId(), title: "Shapes & Lines (LKG)", link: "https://drive.google.com/file/d/1_sample_file_id/view?usp=sharing", classId: "LKG" },
                                                    { id: genId(), title: "Colours & Mixing (UKG)", link: "https://drive.google.com/file/d/2_sample_file_id/view?usp=sharing", classId: "UKG" },
                                                            { id: genId(), title: "Basic Animals (1-2)", link: "https://drive.google.com/file/d/3_sample_file_id/view?usp=sharing", classId: "1-2" }
                          ],
                                pdfs: [
                                            { id: genId(), title: "Graph Sheet - A4", url: "https://example.com/graph_sample.pdf" },
                                                    { id: genId(), title: "Practice Sheet - Flowers", url: "https://example.com/flower_sheet.pdf" }
                                ],
                                      tasks: [], // {id, userEmail, filename, note, date}
                                            payments: [] // {id, userEmail, month, amount, proofURL, status}
                };
                    write(STORAGE_KEYS.CONTENT, c);
        }
}

function ensureUsers(){
      let users = read(STORAGE_KEYS.USERS, []);
        // Ensure admin user exists
          if (!users.find(u=>u.email === ADMIN_CREDENTIALS.email)){
                users.push({ name: "Admin", email: ADMIN_CREDENTIALS.email, pass: ADMIN_CREDENTIALS.pass, whatsapp: "", classId: "admin", isAdmin:true });
                    write(STORAGE_KEYS.USERS, users);
          }
}

function genId(){ return 'id_' + Math.random().toString(36).slice(2,9); }

// UI navigation
const views = {
      home: "#home-view",
        about: "#about-view",
          plans: "#plans-view",
            auth: "#auth-view",
              dashboard: "#dashboard-view",
                payment: "#payment-view",
                  admin: "#admin-view"
};

function showView(viewSelector){
      document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
        const el = document.querySelector(viewSelector);
          if (el) el.classList.remove('hidden');
            window.scrollTo(0,0);
}

// On load
document.addEventListener('DOMContentLoaded', ()=>{
      ensureInitialContent();
        ensureUsers();
          wireNav();
            populatePlansTable();
              populatePlanSelect();
                wireAuthForms();
                  wireAdminForms();
                    wireDashboardActions();
                      wireCTAButtons();
                        updateWhatsAppContact();
                          checkSessionOnLoad();
});

// Navigation buttons
function wireNav(){
      $('#nav-home').onclick = ()=> showView(views.home);
        $('#nav-about').onclick = ()=> showView(views.about);
          $('#nav-plans').onclick = ()=> showView(views.plans);
            $('#nav-login').onclick = ()=> showView(views.auth);
              $('#nav-admin').onclick = ()=> showView(views.admin);
                $('#join-now').onclick = ()=> showView(views.auth);
}

// Plans table
function populatePlansTable(){
      const tbody = $('#plans-list');
        tbody.innerHTML = "";
          CLASS_PLANS.forEach(p=>{
                const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${p.label}</td><td>₹${p.fee}</td>`;
                        tbody.appendChild(tr);
          });
}

// Register & login
function populatePlanSelect(){
      const sel = $('#reg-class');
        sel.innerHTML = "";
          CLASS_PLANS.forEach(p=>{
                const opt = document.createElement('option');
                    opt.value = p.id; opt.textContent = `${p.label} — ₹${p.fee}`;
                        sel.appendChild(opt);
          });
}

function wireAuthForms(){
      $('#register-form').onsubmit = (e)=>{
            e.preventDefault();
                const name = $('#reg-name').value.trim();
                    const email = $('#reg-email').value.trim().toLowerCase();
                        const pass = $('#reg-pass').value;
                            const whatsapp = $('#reg-whatsapp').value.trim();
                                const classId = $('#reg-class').value;

                                    if (!name || !email || !pass) return alert('Please fill all fields');
                                        let users = read(STORAGE_KEYS.USERS, []);
                                            if (users.find(u=>u.email===email)) return alert('Email already registered. Please login.');

                                                users.push({ id: genId(), name, email, pass, whatsapp, classId, isAdmin:false });
                                                    write(STORAGE_KEYS.USERS, users);
                                                        alert('Registered! You can now login.');
                                                            $('#register-form').reset();
                                                                showView(views.auth);
      };

        $('#login-form').onsubmit = (e)=>{
                e.preventDefault();
                    const email = $('#login-email').value.trim().toLowerCase();
                        const pass = $('#login-pass').value;
                            const users = read(STORAGE_KEYS.USERS, []);
                                const u = users.find(x=>x.email===email && x.pass===pass);
                                    if (!u) return alert('Invalid credentials');
                                        write(STORAGE_KEYS.SESS, { email: u.email });
                                            afterLogin(u);
        };
}

// After login show dashboard
function afterLogin(user){
      if (user.isAdmin) {
            // Admin goes to admin panel
                showView(views.admin);
                    $('#admin-panel').classList.remove('hidden');
                        populateAdminStudents();
                            return;
      }
        showView(views.dashboard);
          $('#dash-welcome').textContent = `Welcome, ${user.name}`;
            $('#btn-logout').onclick = ()=>{ localStorage.removeItem(STORAGE_KEYS.SESS); showView(views.home); };
              $('#btn-pay').onclick = ()=> openPaymentForCurrentUser();
                refreshDashboard();
}

// Check session
function checkSessionOnLoad(){
      const sess = read(STORAGE_KEYS.SESS);
        if (sess && sess.email){
                const users = read(STORAGE_KEYS.USERS, []);
                    const u = users.find(x=>x.email===sess.email);
                        if (u) {
                                  // Auto-login
                                        afterLogin(u);
                        } else {
                                  localStorage.removeItem(STORAGE_KEYS.SESS);
                                        showView(views.home);
                        }
        } else {
                showView(views.home);
        }
}

// Dashboard: refresh content for current user
function refreshDashboard(){
      const sess = read(STORAGE_KEYS.SESS);
        if (!sess) return showView(views.home);
          const users = read(STORAGE_KEYS.USERS, []);
            const me = users.find(u=>u.email===sess.email);
              if (!me) return showView(views.home);

                // Payment status
                  const content = read(STORAGE_KEYS.CONTENT);
                    // check last payment for current month (simple: just check any payment with status 'paid' for user's email)
                      const pay = (content.payments || []).find(p=>p.userEmail===me.email && p.status === 'paid');
                        $('#payment-status').textContent = pay ? `Paid (₹${pay.amount})` : 'Not Paid';

                          // PDFs
                            const pdfList = $('#pdf-list');
                              pdfList.innerHTML = "";
                                (content.pdfs || []).forEach(pdf=>{
                                        const li = document.createElement('li');
                                            li.innerHTML = `<a href="${pdf.url}" target="_blank">${escapeHtml(pdf.title)}</a>`;
                                                pdfList.appendChild(li);
                                });

                                  // Videos filtered by class
                                    const videoContainer = $('#video-list');
                                      videoContainer.innerHTML = "";
                                        (content.videos || []).filter(v => v.classId === me.classId || v.classId === "ALL").forEach(v=>{
                                                const wrapper = document.createElement('div');
                                                    wrapper.className = 'video-wrap';
                                                        const embedSrc = drivePreviewLink(v.link);
                                                            wrapper.innerHTML = `<h4>${escapeHtml(v.title)}</h4>
                                                                  <div style="aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;margin-bottom:10px">
                                                                          <iframe width="100%" height="100%" src="${embedSrc}" frameborder="0" allow="autoplay; fullscreen" style="border:0"></iframe>
                                                                                </div>`;
                                                                                    videoContainer.appendChild(wrapper);
                                        });

                                          // Tasks
                                            const taskList = $('#task-list');
                                              taskList.innerHTML = "";
                                                const tasks = (content.tasks || []).filter(t=>t.userEmail === me.email);
                                                  if (tasks.length === 0) taskList.innerHTML = "<p class='muted'>No tasks submitted yet.</p>";
                                                    tasks.forEach(t=>{
                                                            const div = document.createElement('div');
                                                                div.className = 'task-item';
                                                                    div.innerHTML = `<p><strong>${t.date}</strong> — ${escapeHtml(t.note || 'Practice image')}</p>
                                                                          ${t.filename ? `<p><a href="${t.fileURL}" target="_blank">View submission</a></p>` : ''}`;
                                                                              taskList.appendChild(div);
                                                    });
}

// Simple escape
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }

// Convert various drive share links to preview iframe link
function drivePreviewLink(url){
      try{
            // if already preview link contains /preview or /view -> convert to /preview
                const m = url.match(/\/d\/([^\/]+)\//);
                    if (m && m[1]){
                              return `https://drive.google.com/file/d/${m[1]}/preview`;
                    }
                        // fallback: return url as-is
                            return url;
      }catch(e){ return url; }
}

// Task submissions
function wireDashboardActions(){
      $('#task-submit-form').onsubmit = (e)=>{
            e.preventDefault();
                const sess = read(STORAGE_KEYS.SESS);
                    if (!sess) return alert('Please login');
                        const users = read(STORAGE_KEYS.USERS, []);
                            const me = users.find(u=>u.email === sess.email);
                                const fileInput = $('#task-image');
                                    const file = fileInput.files[0];
                                        if (!file) return alert('Please choose an image to submit');
                                            // convert to data URL (for demo)
                                                const reader = new FileReader();
                                                    reader.onload = function(ev){
                                                              const dataUrl = ev.target.result;
                                                                    const content = read(STORAGE_KEYS.CONTENT);
                                                                          const task = { id: genId(), userEmail: me.email, filename: file.name, fileURL: dataUrl, note: file.name, date: new Date().toLocaleString() };
                                                                                content.tasks.push(task);
                                                                                      write(STORAGE_KEYS.CONTENT, content);
                                                                                            alert('Task submitted!');
                                                                                                  fileInput.value = "";
                                                                                                        refreshDashboard();
                                                    };
                                                        reader.readAsDataURL(file);
      };

        // Payment page copy UPI
          $('#copy-upi').onclick = ()=>{
                const id = $('#upi-id').textContent.trim();
                    navigator.clipboard?.writeText(id).then(()=> alert('UPI ID copied'));
          };

            // Submit payment proof
              $('#submit-payment-proof').onclick = async ()=>{
                    const sess = read(STORAGE_KEYS.SESS);
                        if (!sess) return alert('Please login');
                            const users = read(STORAGE_KEYS.USERS, []);
                                const me = users.find(u=>u.email === sess.email);
                                    const proofInput = $('#payment-proof');
                                        const file = proofInput.files[0];
                                            if (!file) return alert('Please upload payment screenshot');
                                                // read file data URL
                                                    const reader = new FileReader();
                                                        reader.onload = ()=>{
                                                                  const dataUrl = reader.result;
                                                                        const content = read(STORAGE_KEYS.CONTENT);
                                                                              const plan = CLASS_PLANS.find(p=>p.id === me.classId) || CLASS_PLANS[0];
                                                                                    const payment = { id: genId(), userEmail: me.email, month: new Date().toLocaleString(), amount: plan.fee, proofURL: dataUrl, status: 'paid' };
                                                                                          content.payments.push(payment);
                                                                                                write(STORAGE_KEYS.CONTENT, content);
                                                                                                      alert('Payment recorded. Thank you!');
                                                                                                            refreshDashboard();
                                                                                                                  showView(views.dashboard);
                                                        };
                                                            reader.readAsDataURL(file);
              };
}

// Payment open for user: populate amount
function openPaymentForCurrentUser(){
      const sess = read(STORAGE_KEYS.SESS);
        if (!sess) return alert('Please login');
          const users = read(STORAGE_KEYS.USERS, []);
            const me = users.find(u=>u.email === sess.email);
              const plan = CLASS_PLANS.find(p=>p.id === me.classId) || CLASS_PLANS[0];
                $('#upi-amount').textContent = plan.fee;
                  showView(views.payment);
}

// Admin forms
function wireAdminForms(){
      // Admin login within admin view
        $('#admin-login-form').onsubmit = (e)=>{
                e.preventDefault();
                    const email = $('#admin-email').value.trim().toLowerCase();
                        const pass = $('#admin-pass').value;
                            if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.pass){
                                      // show admin panel
                                            $('#admin-panel').classList.remove('hidden');
                                                  $('#admin-login-form').classList.add('hidden');
                                                        populateAdminStudents();
                            } else {
                                      alert('Invalid admin credentials');
                            }
        };

          // Add video
            $('#add-video-form').onsubmit = (e)=>{
                    e.preventDefault();
                        const title = $('#video-title').value.trim();
                            const link = $('#video-link').value.trim();
                                if (!title || !link) return alert('Please enter title and link');
                                    const classId = "ALL"; // you can enhance to choose class
                                        const content = read(STORAGE_KEYS.CONTENT);
                                            content.videos.push({ id: genId(), title, link, classId });
                                                write(STORAGE_KEYS.CONTENT, content);
                                                    $('#add-video-form').reset();
                                                        alert('Video added');
            };

              // Add PDF
                $('#add-pdf-form').onsubmit = (e)=>{
                        e.preventDefault();
                            const title = $('#pdf-title').value.trim();
                                const link = $('#pdf-link').value.trim();
                                    if (!title || !link) return alert('Please enter title and URL');
                                        const content = read(STORAGE_KEYS.CONTENT);
                                            content.pdfs.push({ id: genId(), title, url: link });
                                                write(STORAGE_KEYS.CONTENT, content);
                                                    $('#add-pdf-form').reset();
                                                        alert('PDF added');
                };
}

// Admin: list students & mark payments
function populateAdminStudents(){
      const container = $('#admin-students');
        const users = read(STORAGE_KEYS.USERS, []).filter(u=>!u.isAdmin);
          const content = read(STORAGE_KEYS.CONTENT);
            container.innerHTML = "";
              if (users.length === 0) container.textContent = "No students yet.";
                users.forEach(u=>{
                        const div = document.createElement('div');
                            const paid = (content.payments || []).some(p=>p.userEmail === u.email && p.status === 'paid');
                                div.className = "admin-student card";
                                    div.style.marginBottom = "8px";
                                        div.innerHTML = `<strong>${escapeHtml(u.name)}</strong> — ${escapeHtml(u.email)} <br/>
                                              Class: ${escapeHtml(u.classId || '')} • WhatsApp: ${escapeHtml(u.whatsapp || '')}
                                                    <p>Status: ${paid ? '<span style="color:green">Paid</span>' : '<span style="color:#c00">Not Paid</span>'}</p>
                                                          <button class="btn small admin-mark-paid" data-email="${u.email}">Mark Paid</button>
                                                                <button class="btn small admin-view" data-email="${u.email}">View Submissions</button>
                                                                    `;
                                                                        container.appendChild(div);
                });

                  // wire admin buttons
                    $all('.admin-mark-paid').forEach(btn=>{
                            btn.onclick = (e)=>{
                                      const email = e.target.dataset.email;
                                            const content = read(STORAGE_KEYS.CONTENT);
                                                  const plan = CLASS_PLANS[0];
                                                        content.payments.push({ id: genId(), userEmail: email, month: new Date().toLocaleString(), amount: plan.fee, proofURL: '', status:'paid' });
                                                              write(STORAGE_KEYS.CONTENT, content);
                                                                    alert('Marked as paid');
                                                                          populateAdminStudents();
                            };
                    });

                      $all('.admin-view').forEach(btn=>{
                            btn.onclick = (e)=>{
                                      const email = e.target.dataset.email;
                                            const content = read(STORAGE_KEYS.CONTENT);
                                                  const tasks = (content.tasks || []).filter(t=>t.userEmail === email);
                                                        if (tasks.length === 0) return alert('No submissions from this student yet.');
                                                              let msg = `Submissions for ${email}:\n\n`;
                                                                    tasks.forEach(t=> msg += `${t.date} — ${t.filename}\n`);
                                                                          alert(msg);
                            };
                      });
}

// small util: WhatsApp contact button
function updateWhatsAppContact(){
      const whatsappNumber = promptIfNotSetWhatsApp();
        const a = $('#whatsapp-contact');
          if (!a) retu
            const num = whatsappNumber || "919585406124"; // fallback
              a.href = `https://wa.me/${num.replace(/\D/g,'')}`;
                a.textContent = "Contact on WhatsApp";
}

function promptIfNotSetWhatsApp(){
      // if there's a logged-in session, we can use their number; otherwise a default
        const sess = read(STORAGE_KEYS.SESS);
          if (!sess) return null;
            const users = read(STORAGE_KEYS.USERS, []);
              const me = users.find(u=>u.email === sess.email);
                return me ? (me.whatsapp || null) : null;
}

// small helper: escape and convert plain drive share to preview
// (already in drivePreviewLink function)

// End of file

}
}
                            }
                      })
                            }
                    })
                })
}
                }
            }
                            }
                            }
        }
}
}
                                                        }
              }
          }
                                                    }
      }
}
                    }
      }
}
                                                    })
                                        })
                                })
}
        }
                        }
                        }
        }
}
      }
}
        }
      }
}
          })
}
          })
}
}
})
}
}
          }
}
                                ]
                          ]
                }
        }
}
}
]
}