import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { esc, timeAgo, setBusy } from './utils.js';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);

const DELETE_WINDOW_SECONDS = 60;
let deleteTimer = null;

// ── Click counters ───────────────────────────────
async function loadCounters() {
  const { data } = await sb.from('click_counters').select('button_name, count');
  if (!data) return;
  data.forEach(({ button_name, count }) => {
    const el = $(`count-${button_name}`);
    if (el) el.textContent = count > 0 ? count : '0';
  });
}

async function trackClick(btn) {
  const el = $(`count-${btn}`);
  if (el) el.textContent = (parseInt(el.textContent, 10) || 0) + 1;
  await sb.rpc('increment_click', { btn });
}

// ── Guestbook ────────────────────────────────────
async function loadGuestbook() {
  const { data, error } = await sb
    .from('guestbook')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })
    .limit(30);

  const list = $('guestbook-list');

  if (error || !data || data.length === 0) {
    list.innerHTML = '<p class="empty-state">Nenhum recado ainda. Seja o primeiro!</p>';
    return;
  }

  list.innerHTML = data
    .map(
      (p) => `
    <div class="gb-post" id="post-${esc(p.id)}">
      <div class="gb-post-header">
        <span class="gb-post-name">${esc(p.name)}</span>
        <span class="gb-post-time">${timeAgo(p.created_at)}</span>
      </div>
      <p class="gb-post-msg">${esc(p.message)}</p>
    </div>
  `,
    )
    .join('');
}

function startDeleteCountdown(post, id) {
  clearInterval(deleteTimer);

  const delBtn = document.createElement('button');
  delBtn.className = 'gb-delete-btn';
  delBtn.textContent = `Deletar (${DELETE_WINDOW_SECONDS}s)`;
  delBtn.addEventListener('click', () => deletePost(id, delBtn));
  post.appendChild(delBtn);

  let sec = DELETE_WINDOW_SECONDS - 1;
  deleteTimer = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(deleteTimer);
      delBtn.remove();
    } else {
      delBtn.textContent = `Deletar (${sec}s)`;
    }
  }, 1000);
}

async function submitGuestbook() {
  const nameEl = $('gb-name');
  const messageEl = $('gb-message');
  const btn = document.querySelector('.gb-form-wrap .btn-submit');
  const name = nameEl.value.trim();
  const message = messageEl.value.trim();

  if (!name || !message) {
    alert('Preencha nome e recado antes de publicar.');
    return;
  }

  setBusy(btn, true, 'Publicando...', 'Publicar recado');

  const { data, error } = await sb.from('guestbook').insert({ name, message }).select().single();

  setBusy(btn, false, 'Publicando...', 'Publicar recado');

  if (error || !data) {
    alert('Erro ao publicar. Tente novamente.');
    return;
  }

  nameEl.value = '';
  messageEl.value = '';

  await loadGuestbook();

  const post = $(`post-${data.id}`);
  if (post) startDeleteCountdown(post, data.id);
}

async function deletePost(id, btn) {
  btn.disabled = true;
  const { error } = await sb.from('guestbook').delete().eq('id', id);
  if (error) {
    btn.disabled = false;
    alert('Tempo esgotado para deletar.');
    return;
  }
  clearInterval(deleteTimer);
  $(`post-${id}`)?.remove();
}

// ── Contact form ─────────────────────────────────
async function submitContact() {
  const fields = { name: $('ct-name'), email: $('ct-email'), message: $('ct-message') };
  const feedback = $('ct-feedback');
  const btn = document.querySelector('.ct-form-wrap .btn-submit');
  const payload = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    message: fields.message.value.trim(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    feedback.textContent = 'Preencha todos os campos.';
    feedback.className = 'ct-feedback error';
    return;
  }

  setBusy(btn, true, 'Enviando...', 'Enviar mensagem');
  feedback.textContent = '';

  const { error } = await sb.from('contact_messages').insert(payload);

  setBusy(btn, false, 'Enviando...', 'Enviar mensagem');

  if (error) {
    feedback.textContent = 'Erro ao enviar. Tente novamente.';
    feedback.className = 'ct-feedback error';
    return;
  }

  feedback.textContent = 'Mensagem enviada! Responderei em breve.';
  feedback.className = 'ct-feedback success';
  Object.values(fields).forEach((el) => {
    el.value = '';
  });
}

// ── Init ─────────────────────────────────────────
document.querySelectorAll('[data-track]').forEach((el) => {
  el.addEventListener('click', () => trackClick(el.dataset.track));
});
document.querySelector('.gb-form-wrap .btn-submit').addEventListener('click', submitGuestbook);
document.querySelector('.ct-form-wrap .btn-submit').addEventListener('click', submitContact);

Promise.all([loadCounters(), loadGuestbook()]);
