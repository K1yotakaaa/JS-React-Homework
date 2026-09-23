'use strict'
const $ = id => document.getElementById(id)
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
let failRate = 0.3
$('fr').oninput = e => {
	failRate = e.target.value / 100
	$('frv').textContent = e.target.value + '%'
}

/* 1. Closure: private counter */
function createTask(name, onChange = () => {}) {
	let count = 0
	let status = 'Idle'
	let time = null,
		delay = 0,
		span = null

	const simulate = () =>
		new Promise((resolve, reject) => {
			setTimeout(
				() =>
					Math.random() < failRate
						? reject(new Error(name + ' failed'))
						: resolve(delay),
				delay,
			)
		})

	return {
		name,
		async run() {
			count++
			delay = rand(500, 2000)
			status = 'Loading'
			time = null
			onChange()
			const start = performance.now()
			try {
				await simulate()
				status = 'Completed'
			} catch (err) {
				status = 'Failed'
				throw err
			} finally {
				span = { s: start, e: performance.now() }
				time = Math.round(span.e - start)
				onChange()
			}
		},
		getCount: () => count,
		getDelay: () => delay,
		getSpan: () => span,
		getStatus: () => status,
		getTime: () => time,
		reset() {
			count = 0
			status = 'Idle'
			time = null
			onChange()
		},
	}
}

const names = ['Load Users', 'Load Posts', 'Load Comments']
const tasks = names.map((n, i) => createTask(n, () => render(i)))

function render(i) {
	const t = tasks[i],
		el = $('task' + i)
	el.className = 'card ' + t.getStatus().toLowerCase()
	el.querySelector('.st').textContent = t.getStatus()
	el.querySelector('.cnt').textContent = t.getCount()
	el.querySelector('.tm').textContent =
		t.getTime() === null ? '-' : t.getTime() + ' ms'
	const p = el.querySelector('.prog i'),
		s = t.getStatus()
	if (s === 'Idle' || s === 'Loading') {
		p.style.transition = 'none'
		p.style.width = '0'
		void p.offsetWidth
		if (s === 'Loading') {
			p.style.transition = `width ${t.getDelay()}ms linear`
			p.style.width = '100%'
		}
	}
}

tasks.forEach((t, i) => {
	const d = document.createElement('div')
	d.id = 'task' + i
	d.innerHTML = `<b>${t.name}</b><dl><dt>Status</dt><dd class="st"></dd><dt>Runs</dt><dd class="cnt"></dd><dt>Time</dt><dd class="tm"></dd></dl><div class="prog"><i></i></div>
    <button>Run</button><button class="ghost">Reset</button>`
	const [run, reset] = d.querySelectorAll('button')
	run.onclick = () => t.run().catch(() => {})
	reset.onclick = () => t.reset()
	$('tasks').append(d)
	render(i)
})

/* concurrent vs sequential */
async function runSequential() {
	const start = performance.now()
	for (const t of tasks) {
		try {
			await t.run()
		} catch {
		}
	}
	return Math.round(performance.now() - start)
}
async function runConcurrent() {
	const start = performance.now()
	await Promise.allSettled(tasks.map(t => t.run()))
	return Math.round(performance.now() - start)
}

const busy = (btns, on) => btns.forEach(b => (b.disabled = on))
const allBtns = () => [...document.querySelectorAll('button')]

$('runAll').onclick = async () => {
	busy(allBtns(), true)
	$('allStatus').textContent = 'Running...'
	const ms = await runConcurrent()
	const failed = tasks.filter(t => t.getStatus() === 'Failed').length
	$('allStatus').textContent =
		`All tasks finished in ${ms} ms (${tasks.length - failed} completed, ${failed} failed)`
	busy(allBtns(), false)
}
$('resetAll').onclick = () => {
	tasks.forEach(t => t.reset())
	$('allStatus').textContent = ''
}

const snap = t0 =>
	tasks.map(t => ({
		n: t.name.replace('Load ', ''),
		s: t.getSpan().s - t0,
		e: t.getSpan().e - t0,
		bad: t.getStatus() === 'Failed',
	}))
function gantt(label, spans, max) {
	const rows = spans
		.map(
			x =>
				`<div class="g-row"><em>${x.n}</em><div class="g-track"><b class="${x.bad ? 'bad' : ''}" style="left:${(x.s / max) * 100}%;width:${((x.e - x.s) / max) * 100}%"></b></div></div>`,
		)
		.join('')
	return `<div class="bar-wrap"><div class="bar-label">${label}</div>${rows}</div>`
}
$('compare').onclick = async () => {
	busy(allBtns(), true)
	$('bars').innerHTML = ''
	$('explain').textContent = 'Running sequentially, then concurrently...'
	let t0 = performance.now()
	const seq = await runSequential(),
		a = snap(t0)
	t0 = performance.now()
	const con = await runConcurrent(),
		b = snap(t0)
	const max = Math.max(seq, con)
	$('bars').innerHTML =
		gantt(`Sequential: ${seq} ms`, a, max) +
		gantt(`Concurrent: ${con} ms`, b, max)
	$('explain').textContent =
		`Sequential ≈ sum of all delays; concurrent ≈ the slowest single delay. Timers run side by side, so waiting overlaps. Concurrent was ${(seq / con).toFixed(1)}x faster.`
	busy(allBtns(), false)
}

/* 3. Event loop demo */
const demoSource = `function demo(log) {
  log("1. script start");                                   // sync
  setTimeout(() => log("timer 1 (0ms)"), 0);                // task
  setTimeout(() => log("timer 2 (10ms)"), 10);              // task
  Promise.resolve()
    .then(() => log("promise 1"))                           // microtask
    .then(() => log("promise 2"));                          // microtask
  (async () => {
    log("async fn start");                                  // sync
    await null;
    log("async fn after await");                            // microtask
  })();
  log("script end");                                        // sync
}`
$('code').textContent = demoSource
$('expected').value = [
	'script start',
	'async fn start',
	'script end',
	'promise 1',
	'async fn after await',
	'promise 2',
	'timer 1 (0ms)',
	'timer 2 (10ms)',
].join('\n')

function demo(log) {
	log('script start', 'sync')
	setTimeout(() => log('timer 1 (0ms)', 'macro'), 0)
	setTimeout(() => log('timer 2 (10ms)', 'macro'), 10)
	Promise.resolve()
		.then(() => log('promise 1', 'micro'))
		.then(() => log('promise 2', 'micro'))
	;(async () => {
		log('async fn start', 'sync')
		await null
		log('async fn after await', 'micro')
	})()
	log('script end', 'sync')
}

$('runLoop').onclick = () => {
	const ul = $('actual')
	ul.innerHTML = ''
	$('loopExplain').textContent = ''
	const guess = $('expected')
		.value.split('\n')
		.map(s => s.trim())
	let n = 0,
		hit = 0
	const total = guess.filter(Boolean).length
	demo((msg, kind) => {
		const li = document.createElement('li')
		li.textContent = msg
		li.className = kind
		if (guess[n] !== msg) li.classList.add('miss')
		else hit++
		n++
		$('score').textContent = `Prediction match so far: ${hit}/${total}`
		ul.append(li)
		console.log(msg)
	})
	$('loopExplain').innerHTML =
		'Call stack runs all sync code first (blue). When it is empty, the event loop drains the whole microtask queue (green), including microtasks added meanwhile. Only then it takes one task (orange) from the task queue. Timers wait outside the stack, so JS never blocks.'
}

const steps = [
	[
		'The script itself is the first thing on the call stack.',
		['main()'],
		[],
		[],
		[],
		'',
	],
	[
		'Sync call: log runs and prints.',
		['main()', 'log'],
		[],
		[],
		[],
		'script start',
	],
	[
		'setTimeout hands both timers to the browser and returns at once.',
		['main()', 'setTimeout'],
		['timer 1', 'timer 2'],
		[],
		[],
		'',
	],
	[
		'Promise.resolve().then(...) queues promise 1 as a microtask.',
		['main()', '.then'],
		['timer 1', 'timer 2'],
		['promise 1'],
		[],
		'',
	],
	[
		'The async function runs synchronously until its first await.',
		['main()', 'asyncFn()', 'log'],
		['timer 1', 'timer 2'],
		['promise 1'],
		[],
		'async fn start',
	],
	[
		'await pauses asyncFn. Its continuation becomes a microtask.',
		['main()'],
		['timer 1', 'timer 2'],
		['promise 1', 'asyncFn rest'],
		[],
		'',
	],
	[
		'Last sync line of the script.',
		['main()', 'log'],
		['timer 1', 'timer 2'],
		['promise 1', 'asyncFn rest'],
		[],
		'script end',
	],
	[
		'Stack is empty. The event loop checks microtasks first.',
		[],
		['timer 1', 'timer 2'],
		['promise 1', 'asyncFn rest'],
		[],
		'',
	],
	[
		'Run promise 1. It queues promise 2 at the back.',
		['promise 1'],
		['timer 1', 'timer 2'],
		['asyncFn rest', 'promise 2'],
		[],
		'promise 1',
	],
	[
		'Run the async continuation.',
		['asyncFn rest'],
		['timer 1', 'timer 2'],
		['promise 2'],
		[],
		'async fn after await',
	],
	[
		'Run promise 2. Microtask queue is now empty.',
		['promise 2'],
		['timer 1', 'timer 2'],
		[],
		[],
		'promise 2',
	],
	[
		'Timers finish waiting and move to the task queue.',
		[],
		[],
		[],
		['timer 1', 'timer 2'],
		'',
	],
	[
		'The event loop takes ONE task.',
		['timer 1'],
		[],
		[],
		['timer 2'],
		'timer 1 (0ms)',
	],
	[
		'Microtasks are empty, so the next task runs.',
		['timer 2'],
		[],
		[],
		[],
		'timer 2 (10ms)',
	],
	['Done. Stack and queues are empty.', [], [], [], [], ''],
]
let at = -1,
	timer
function go(n) {
	at = n
	const cols = at < 0 ? [[], [], [], []] : steps[at].slice(1, 5)
	const out = steps
		.slice(0, at + 1)
		.map(s => s[5])
		.filter(Boolean)
	const lane = (title, items, cls = '') =>
		`<div class="lane"><h4>${title}</h4>${items.map(c => `<span class="chip ${cls}">${c}</span>`).join('')}</div>`
	$('lanes').innerHTML =
		['Call stack', 'Web APIs', 'Microtask queue', 'Task queue']
			.map((l, i) => lane(l, cols[i]))
			.join('') + lane('Console', out, 'out')
	$('note').textContent =
		at < 0
			? 'Press Step to move through the demo one moment at a time.'
			: steps[at][0]
}
$('step').onclick = () => {
	clearInterval(timer)
	go(at < steps.length - 1 ? at + 1 : 0)
}
$('auto').onclick = () => {
	clearInterval(timer)
	go(0)
	timer = setInterval(
		() => (at < steps.length - 1 ? go(at + 1) : clearInterval(timer)),
		1200,
	)
}
$('rewind').onclick = () => {
	clearInterval(timer)
	go(-1)
}
go(-1)
