function esc(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}
function setCode(id, code) {
	document.getElementById(id).textContent = code.trim()
}
function fmt(v) {
	if (v === undefined) return 'undefined'
	if (v === null) return 'null'
	if (typeof v === 'string') return v
	try {
		return JSON.stringify(v)
	} catch (e) {
		return String(v)
	}
}
function makeLogger(outId) {
	const el = document.getElementById(outId)
	return function (label, value) {
		const line = document.createElement('div')
		if (arguments.length === 1) {
			line.innerHTML = `<span class="val">${esc(label)}</span>`
		} else {
			line.innerHTML = `<span class="lbl">${esc(label)} →</span> <span class="val">${esc(fmt(value))}</span>`
		}
		el.appendChild(line)
	}
}

/* Exercise 1 */
;(function () {
	const code = `
const studentName = "Aigerim";
const age = 21;
let isActive = true;
const courses = ["Math", "Physics", "JS"];
const address = { city: "Almaty", street: "Abay Ave" };

let scholarship = null;
let major;

const sentence =
  \`\${studentName} is \${age} years old, currently \${isActive ? "active" : "inactive"}, and lives in \${address.city}.\`
`
	setCode('code-1', code)

	const studentName = 'Aigerim'
	const age = 21
	let isActive = true
	const courses = ['Math', 'Physics', 'JS']
	const address = { city: 'Almaty', street: 'Abay Ave' }
	let scholarship = null
	let major
	const sentence = `${studentName} is ${age} years old, currently ${isActive ? 'active' : 'inactive'}, and lives in ${address.city}.`

	const log = makeLogger('out-1')
	log(`name: ${studentName}  (${typeof studentName})`)
	log(`age: ${age}  (${typeof age})`)
	log(`isActive: ${isActive}  (${typeof isActive})`)
	log(`courses: ${JSON.stringify(courses)}  (${typeof courses}, reference)`)
	log(`address: ${JSON.stringify(address)}  (${typeof address}, reference)`)
	log(`scholarship: ${scholarship}  (${typeof scholarship})`)
	log(`major: ${major}  (${typeof major})`)
	log('—')
	log(`sentence: "${sentence}"`)
	log('—')
	log('primitives: name, age, isActive, scholarship, major')
	log('references: courses, address')
})()

/* Exercise 2 */
;(function () {
	const code = `
const numbers = [3, 7, 2, 10, 5];

const doubled       = numbers.map(n => n * 2);
const greaterThan5   = numbers.filter(n => n > 5);
const firstOver5     = numbers.find(n => n > 5);
const sum            = numbers.reduce((total, n) => total + n, 0);
const has10          = numbers.includes(10);
`
	setCode('code-2', code)

	const numbers = [3, 7, 2, 10, 5]
	const doubled = numbers.map(n => n * 2)
	const greaterThan5 = numbers.filter(n => n > 5)
	const firstOver5 = numbers.find(n => n > 5)
	const sum = numbers.reduce((total, n) => total + n, 0)
	const has10 = numbers.includes(10)

	const log = makeLogger('out-2')
	log('doubled', doubled)
	log('greaterThan5', greaterThan5)
	log('firstOver5', firstOver5)
	log('sum', sum)
	log('has10', has10)
	log('original numbers (untouched)', numbers)
})()

/* Exercise 3 */
;(function () {
	const code = `
const students = [
  { id: 1, name: "Anna", grade: 85 },
  { id: 2, name: "John", grade: 62 },
  { id: 3, name: "Sara", grade: 91 },
  { id: 4, name: "Mike", grade: 55 },
];

const passed      = students.filter(s => s.grade >= 70);
const names       = students.map(s => s.name);
const studentById = students.find(s => s.id === 3);
const topStudent  = students.reduce((top, s) => s.grade > top.grade ? s : top);
const average     = students.reduce((sum, s) => sum + s.grade, 0) / students.length;

const withPassFlag = students.map(s => ({ ...s, passed: s.grade >= 70 }));
`
	setCode('code-3', code)

	const students = [
		{ id: 1, name: 'Anna', grade: 85 },
		{ id: 2, name: 'John', grade: 62 },
		{ id: 3, name: 'Sara', grade: 91 },
		{ id: 4, name: 'Mike', grade: 55 },
	]
	const passed = students.filter(s => s.grade >= 70)
	const names = students.map(s => s.name)
	const studentById = students.find(s => s.id === 3)
	const topStudent = students.reduce((top, s) =>
		s.grade > top.grade ? s : top,
	)
	const average =
		students.reduce((sum, s) => sum + s.grade, 0) / students.length
	const withPassFlag = students.map(s => ({ ...s, passed: s.grade >= 70 }))

	const log = makeLogger('out-3')
	log(
		'passed (grade >= 70)',
		passed.map(s => s.name),
	)
	log('names', names)
	log('student with id 3', studentById)
	log('top student', topStudent)
	log('average grade', average.toFixed(2))
	log('with pass flag', withPassFlag)
	log('original students[0] (untouched)', students[0])
})()

/* Exercise 4 */
;(function () {
	const code = `
const user = {
  id: 1,
  name: "Diana",
  age: 27,
  address: { city: "Astana", street: "Kabanbay Batyr" },
};

const { name, address: { city } } = user;

const olderUser   = { ...user, age: 28 };
const withEmail   = { ...olderUser, email: "diana@mail.com" };
const { street, ...withoutStreet } = withEmail;

const { name: n2, age: a2 } = user;
const { address: { city: c2 } } = user;
const { name: userName } = user;
`
	setCode('code-4', code)

	const user = {
		id: 1,
		name: 'Diana',
		age: 27,
		address: { city: 'Astana', street: 'Kabanbay Batyr' },
	}
	const {
		name,
		address: { city },
	} = user
	const olderUser = { ...user, age: 28 }
	const withEmail = { ...olderUser, email: 'diana@mail.com' }
	const { street, ...withoutStreet } = withEmail
	const { name: n2, age: a2 } = user
	const {
		address: { city: c2 },
	} = user
	const { name: userName } = user

	const log = makeLogger('out-4')
	log('name', name)
	log('city', city)
	log('olderUser.age', olderUser.age)
	log('withEmail.email', withEmail.email)
	log('withoutStreet', withoutStreet)
	log('destructured name+age', `${n2}, ${a2}`)
	log('nested destructure city', c2)
	log('renamed userName', userName)
	log('original user (untouched)', user)
})()

/* Exercise 5 */
;(function () {
	const code = `
let original = { name: "Alice", score: 10 };
let copy = original;
copy.score = 99;

let base = { name: "Alice", score: 10 };
let safeCopy = { ...base };
safeCopy.score = 50;

let user = { name: "Alice", address: { city: "Almaty" } };
let shallow = { ...user };
shallow.address.city = "Astana";

let deep = { ...user, address: { ...user.address } };
deep.address.city = "Karaganda";
`
	setCode('code-5', code)

	let original = { name: 'Alice', score: 10 }
	let copy = original
	copy.score = 99

	let base = { name: 'Alice', score: 10 }
	let safeCopy = { ...base }
	safeCopy.score = 50

	let user = { name: 'Alice', address: { city: 'Almaty' } }
	let shallow = { ...user }
	shallow.address.city = 'Astana'

	let user2 = { name: 'Alice', address: { city: 'Almaty' } }
	let deep = { ...user2, address: { ...user2.address } }
	deep.address.city = 'Karaganda'

	const log = makeLogger('out-5')
	log('copy = original, then copy.score = 99')
	log('  → original.score', original.score)
	log('  → copy.score', copy.score)
	log('spread copy, then safeCopy.score = 50')
	log('  → base.score (unaffected)', base.score)
	log('  → safeCopy.score', safeCopy.score)
	log('shallow spread, then shallow.address.city = "Astana"')
	log('  → user.address.city (also changed!)', user.address.city)
	log('deep-copied address, then deep.address.city = "Karaganda"')
	log('  → user2.address.city (unaffected)', user2.address.city)
})()

/* Exercise 6 */
;(function () {
	const code = `
function isEven(number) {
  return number % 2 === 0;
}
const isEvenArrow = (number) => number % 2 === 0;

const getFullName = (firstName, lastName) => \`\${firstName} \${lastName}\`;
const calculatePrice = (price, quantity) => price * quantity;
const calculateDiscount = (price, percent) => price - (price * percent) / 100;
const getMax = (a, b) => Math.max(a, b);
`
	setCode('code-6', code)

	function isEven(number) {
		return number % 2 === 0
	}
	const isEvenArrow = number => number % 2 === 0
	const getFullName = (firstName, lastName) => `${firstName} ${lastName}`
	const calculatePrice = (price, quantity) => price * quantity
	const calculateDiscount = (price, percent) => price - (price * percent) / 100
	const getMax = (a, b) => Math.max(a, b)

	const log = makeLogger('out-6')
	log('isEven(4)', isEven(4))
	log('isEvenArrow(7)', isEvenArrow(7))
	log('getFullName("Ali", "Yerlan")', getFullName('Ali', 'Yerlan'))
	log('calculatePrice(1200, 3)', calculatePrice(1200, 3))
	log('calculateDiscount(1000, 15)', calculateDiscount(1000, 15))
	log('getMax(8, 21)', getMax(8, 21))
})()

/* Exercise 7 */
;(function () {
	const code = `
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

const calculate = (a, b, operation) => operation(a, b);

calculate(5, 3, add);
calculate(5, 3, multiply);
`
	setCode('code-7', code)

	const add = (a, b) => a + b
	const multiply = (a, b) => a * b
	const calculate = (a, b, operation) => operation(a, b)

	const log = makeLogger('out-7')
	log('calculate(5, 3, add)', calculate(5, 3, add))
	log('calculate(5, 3, multiply)', calculate(5, 3, multiply))
})()

/* Exercise 8 */
;(function () {
	const code = `
const message = "global";

function scopeDemo() {
  let message = "function";
  if (true) {
    let message = "block";
    console.log("inside block:", message);
  }
  console.log("inside function:", message);
}
scopeDemo();
console.log("global:", message);

{
  var v = "var value";
  let l = "let value";
  const c = "const value";
}
console.log(v);
console.log(l);
`
	setCode('code-8', code)

	const message = 'global'
	const log = makeLogger('out-8')

	function scopeDemo() {
		let message = 'function'
		if (true) {
			let message = 'block'
			log('inside block', message)
		}
		log('inside function', message)
	}
	scopeDemo()
	log('at global scope', message)

	log('—')
	{
		var v = 'var value'
		let l = 'let value'
		const c = 'const value'
	}
	log('v outside the block (var)', v)
	try {
		log('l outside the block (let)', l)
	} catch (e) {
		log('l outside the block (let)', '⚠ ReferenceError — not accessible')
	}
})()

/* Exercise 9 */
;(function () {
	const code = `
function createCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const counter1 = createCounter();
counter1(); counter1(); counter1();

const counter2 = createCounter();
counter2();

function createAdder(value) {
  return (num) => num + value;
}
const addFive = createAdder(5);
addFive(10);
addFive(20);
`
	setCode('code-9', code)

	function createCounter() {
		let count = 0
		return function () {
			count++
			return count
		}
	}
	const counter1 = createCounter()
	const r1 = [counter1(), counter1(), counter1()]
	const counter2 = createCounter()
	const r2 = counter2()

	function createAdder(value) {
		return num => num + value
	}
	const addFive = createAdder(5)

	const log = makeLogger('out-9')
	log('counter1() x3', r1)
	log('counter2() — independent count', r2)
	log('addFive(10)', addFive(10))
	log('addFive(20)', addFive(20))
})()

/* Exercise 10 */
;(function () {
	const code = `
const numbers = [10, 20, 30, 40];
const [first, second] = numbers;

const user = { id: 1, name: "Anna", age: 21 };
const { name, age } = user;

const moreNumbers  = [...numbers, 50];
const olderUser    = { ...user, age: 22 };
const userWithEmail = { ...user, email: "anna@mail.com" };

const combined = [...[1, 2], ...[3, 4]];

function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2);
sum(1, 2, 3, 4);
`
	setCode('code-10', code)

	const numbers = [10, 20, 30, 40]
	const [first, second] = numbers
	const user = { id: 1, name: 'Anna', age: 21 }
	const { name, age } = user
	const moreNumbers = [...numbers, 50]
	const olderUser = { ...user, age: 22 }
	const userWithEmail = { ...user, email: 'anna@mail.com' }
	const combined = [...[1, 2], ...[3, 4]]
	function sum(...nums) {
		return nums.reduce((a, b) => a + b, 0)
	}

	const log = makeLogger('out-10')
	log('first, second', `${first}, ${second}`)
	log('name, age', `${name}, ${age}`)
	log('moreNumbers', moreNumbers)
	log('olderUser', olderUser)
	log('userWithEmail', userWithEmail)
	log('original user (untouched)', user)
	log('combined', combined)
	log('sum(1, 2)', sum(1, 2))
	log('sum(1, 2, 3, 4)', sum(1, 2, 3, 4))
})()

/* Exercise 11 */
;(function () {
	const code = `
const users = [
  { name: "Anna", address: { city: "Almaty" } },
  { name: "John" },
];

users[1].address.city;
users[1]?.address?.city;
users[1]?.address?.city ?? "City not specified";

0     || "default";   0     ?? "default";
""    || "default";   ""    ?? "default";
false || "default";   false ?? "default";
null  || "default";   null  ?? "default";
undefined || "default"; undefined ?? "default";
`
	setCode('code-11', code)

	const users = [
		{ name: 'Anna', address: { city: 'Almaty' } },
		{ name: 'John' },
	]

	const log = makeLogger('out-11')
	try {
		const crash = users[1].address.city
		log('users[1].address.city', crash)
	} catch (e) {
		log('users[1].address.city', '💥 TypeError: Cannot read city of undefined')
	}
	log('users[1]?.address?.city', users[1]?.address?.city)
	log('…with fallback ??', users[1]?.address?.city ?? 'City not specified')
	log('—  ||  vs  ??  —')
	const cases = [0, '', false, null, undefined]
	cases.forEach(v => {
		log(`${JSON.stringify(v)}  ||  "default"`, v || 'default')
		log(`${JSON.stringify(v)}  ??  "default"`, v ?? 'default')
	})
})()

/* Exercise 12 */
;(function () {
	const code = `
const students = [
  { id: 1, name: "Anna",  age: 21, grades: [85, 90, 78] },
  { id: 2, name: "John",  age: 22, grades: [60, 55, 50] },
  { id: 3, name: "Sara",  age: 20, grades: [91, 88, 95] },
  { id: 4, name: "Mike",  age: 23, grades: [45, 60, 50] },
  { id: 5, name: "Aidos", age: 21, grades: [70, 75, 72] },
];

const getAverage        = (grades) => grades.reduce((a, b) => a + b, 0) / grades.length;
const getStudentAverage = (student) => getAverage(student.grades);
const getPassedStudents = (students) => students.filter(s => getStudentAverage(s) >= 60);
const getStudentNames   = (students) => students.map(s => s.name);
const findStudent       = (students, id) => students.find(s => s.id === id);
const getTopStudent     = (students) =>
  students.reduce((top, s) => (getStudentAverage(s) > getStudentAverage(top) ? s : top));

const summary = students.map(s => ({
  id: s.id,
  name: s.name,
  average: getStudentAverage(s),
  passed: getStudentAverage(s) >= 60,
}));
`
	setCode('code-12', code)

	const students = [
		{ id: 1, name: 'Anna', age: 21, grades: [85, 90, 78] },
		{ id: 2, name: 'John', age: 22, grades: [60, 55, 50] },
		{ id: 3, name: 'Sara', age: 20, grades: [91, 88, 95] },
		{ id: 4, name: 'Mike', age: 23, grades: [45, 60, 50] },
		{ id: 5, name: 'Aidos', age: 21, grades: [70, 75, 72] },
	]
	const getAverage = grades => grades.reduce((a, b) => a + b, 0) / grades.length
	const getStudentAverage = student => getAverage(student.grades)
	const getPassedStudents = students =>
		students.filter(s => getStudentAverage(s) >= 60)
	const getStudentNames = students => students.map(s => s.name)
	const findStudent = (students, id) => students.find(s => s.id === id)
	const getTopStudent = students =>
		students.reduce((top, s) =>
			getStudentAverage(s) > getStudentAverage(top) ? s : top,
		)
	const summary = students.map(s => ({
		id: s.id,
		name: s.name,
		average: getStudentAverage(s),
		passed: getStudentAverage(s) >= 60,
	}))

	const log = makeLogger('out-12')
	log('getStudentNames(students)', getStudentNames(students))
	log(
		'getPassedStudents(students)',
		getPassedStudents(students).map(s => s.name),
	)
	log('findStudent(students, 3)', findStudent(students, 3))
	log('getTopStudent(students)', getTopStudent(students).name)
	log('—')
	summary.forEach(s =>
		log(
			`${s.name} (id ${s.id})`,
			`avg ${s.average.toFixed(1)} · passed: ${s.passed}`,
		),
	)
	log('original students[0].grades (untouched)', students[0].grades)
})()

/* Sidebar */
;(function () {
	if (typeof IntersectionObserver === 'undefined') return
	const links = Array.from(document.querySelectorAll('#toc a'))
	const sections = links.map(l =>
		document.querySelector(l.getAttribute('href')),
	)
	const io = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				const idx = sections.indexOf(entry.target)
				if (idx === -1) return
				if (entry.isIntersecting) {
					links.forEach(l => l.classList.remove('active'))
					links[idx].classList.add('active')
				}
			})
		},
		{ rootMargin: '-10% 0px -75% 0px', threshold: 0 },
	)
	sections.forEach(s => s && io.observe(s))
})()
