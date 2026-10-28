# Frontend → Backend Data Contract — Mini Issue Tracker

## الغرض وإزاي تقرا الملف

الملف ده بيوضح **كل البيانات اللي الفرونت هياخدها من اليوزر** (forms, filters, actions) و**كل رقم محسوب** الفرونت محتاجه يعرضه. مبني على التصميم النهائي وعلى `DESIGN_EXCLUSIONS.md`، وأي حاجة مستبعدة هناك مش هنا.

**الرموز:**

| الرمز | المعنى |
|---|---|
| ✅ | Required |
| ⚪ | Optional |
| 🔧 | Auto: السيرفر هو اللي بيحطها، اليوزر مش بيبعتها |
| ❓ | محتاج رد أو قرار من الباك اند (رقم السؤال Q# في آخر الملف) |

**ملاحظات عامة:**

- كل الـ **limits مقترحة** لأن الـ PRD مذكرهاش. الباك اند يعدلها، والمهم تتحط في Zod كمصدر واحد عند الباك اند، والفرونت هيحتفظ بنسخة مطابقة (فولدر `shared/` عنده) لحد ما نحدد إزاي الكود هيتشارك بين الـ repos. **أي تغيير في الـ enums أو الـ limits أو الـ defaults لازم يتبلّغ بيه الفرونت.**
- كل الـ IDs = UUID string.
- `dueDate` = `YYYY-MM-DD` (تاريخ بس من غير وقت). باقي الـ timestamps = ISO 8601 UTC.
- الفرونت بيعمل `trim` للنصوص قبل الإرسال، **والباك اند لازم يتحقق تاني**، لأن الفرونت مش مصدر ثقة.
- النص الفاضي بعد الـ trim **مش بيتبعت**. في الـ PATCH: الحقل الغايب = ما يتغيرش، و`null` = امسح القيمة (للحقول اللي بتقبل ده بس: `description`, `assigneeId`, `dueDate`).
- التصميم مفيهوش: تعديل البروفايل، تعديل/حذف workspace، تعديل/حذف comment، reset password. فمش هنبعت أي بيانات ليهم.

---

## 0. القيم الثابتة (Enums)

المصدر: الـ contract ده والباك اند. الفرونت بيحتفظ بنسخة مطابقة في فولدر `shared/` ومش بيكتبهم في أي مكان تاني. **لو الباك اند غيّر أي قيمة هنا لازم يبلّغ الفرونت.**

| Enum | القيم |
|---|---|
| Issue status | `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled` |
| Issue priority | `no_priority`, `low`, `medium`, `high`, `urgent` |
| Label color | **مقترح (Q3):** `violet`, `magenta`, `indigo`, `olive`, `sand`, `plum` |
| Workspace role | `owner`, `member` |
| Defaults للـ issue الجديدة | `DEFAULT_ISSUE_STATUS = 'todo'`, `DEFAULT_ISSUE_PRIORITY = 'no_priority'` (مقترح) |
| Project status | ❓ **Q2** (مثلًا: `active`, `planning`, `archived`) |

---

## 1. Auth

### Sign Up — `POST /api/auth/signup`

| Field | Type | Required | Rules (مقترحة) |
|---|---|---|---|
| `name` | string | ✅ | 2–60 حرف |
| `email` | string | ✅ | email صالح، أقصى 254، بيتحول lowercase. مكرر → `409` |
| `password` | string | ✅ | 8–128 حرف (**Q8**) |

- مفيش `confirmPassword` (مش في التصميم).
- مؤشرات قوة الباسورد في الشاشة (8+ حروف، أرقام ورموز، تسلسلات شائعة) **للفرونت UX فقط**. الباك اند يفرض إيه بالظبط؟ (**Q8**، اقتراح: الطول بس).
- مفيش SSO، ومفيش workspace handle، ومفيش checkbox موافقة على شروط.
- بعد النجاح: الفرونت بيفترض إن السيرفر عمل session وفتح الجلسة على طول (**Q9**).

### Sign In — `POST /api/auth/signin`

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | ✅ | email صالح |
| `password` | string | ✅ | غير فاضي |

- الغلط بيرجع `401` برسالة عامة (مثلًا "Invalid email or password") **من غير ما نقول أنهي حقل غلط**.
- مفيش "Remember me"، مدة الـ session ثابتة من السيرفر.

### Sign Out
بدون body. بيمسح الـ session.

### بيانات المستخدم الحالي
الفرونت محتاج `id`, `name`, `email` (للـ user menu والـ avatar بالـ initials). مفيش job title.

---

## 2. Workspaces

### Create Workspace

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | 2–60 |
| `description` | string | ⚪ | حتى 280 |
| `slug` | string | 🔧 | ❓ **Q1** |

- **ليه الـ slug مهم:** الـ URL كله `/[workspaceSlug]/...`. التصميم مفيهوش حقل slug، فالمقترح إن السيرفر **يولده من الاسم** (kebab-case، ولو اتكرر يضيف suffix) وإنه **ما يتغيرش** حتى لو الاسم اتغير.
- **Slugs محجوزة (Q23):** الـ slug ممنوع يساوي أي route ثابت في الفرونت: `workspaces`, `my-issues`, `sign-in`, `sign-up`, `join`, `api`. لو اتسمّى workspace كده، صفحاته مش هتتفتح. والسيرفر لازم يرفض الـ slug ده أو يضيف له suffix.
- الـ creator بيبقى `owner` تلقائيًا (🔧).

### Workspace search
| Param | Type | Required | Rules |
|---|---|---|---|
| `q` | string | ⚪ | بيفلتر على الاسم (contains، case-insensitive) وبس داخل workspaces اللي المستخدم عضو فيها |

### كارت الـ workspace (اللي الفرونت محتاجه يرجع)
`id`, `name`, `slug`, `description`, `role`, `projectCount`, `issueCount`, `memberCount`, `countsByStatus` (6 مفاتيح)، `lastActivityAt` (ممكن `null`). تفاصيل الحساب في القسم 9.

### Members + Invite

| Action | Input | Required | ملاحظات |
|---|---|---|---|
| قايمة الأعضاء | — | — | بيرجع `id`, `name`, `email`, `role` |
| Remove member | `userId` | ✅ | للـ owner بس، ومينفعش يشيل نفسه |
| Generate invite link | — (بدون input) | — | بيرجع رابط فيه token |
| Regenerate link | — | — | القديم بيتبطل |
| Preview invite (صفحة Join) | `token` (من الـ URL) | ✅ | بيرجع `workspaceName`, `invitedByName`, `memberCount`، أو خطأ لو الـ token غلط أو منتهي |
| Join | `token` | ✅ | يحتاج session. لو المستخدم مش مسجل، الفرونت بيحوله لـ Sign In ويرجعه |

- ❓ **Q10:** صلاحية الرابط (بيخلص بعد كام؟)، واحد الاستخدام ولا reusable؟ (التصميم فيه رابط واحد قابل للنسخ، فالمقترح reusable لحد ما يتعمل regenerate).

---

## 3. Projects

### Create / Edit Project

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | 2–60. ❓ **Q22:** فريد جوه الـ workspace؟ |
| `description` | string | ⚪ | حتى 500 |
| `status` | enum | ⚪ | ❓ **Q2** |

- **Edit:** نفس الحقول، كلها optional (PATCH).
- **Delete:** `projectId`. الفرونت هيعرض تأكيد فيه عدد الـ issues اللي هتتمسح، فمحتاجين `issueCount` (**Q11**: هل الحذف cascade على الـ issues؟).
- البحث في قايمة المشاريع: `q` (الاسم) و`status` اختياريين.

---

## 4. Issues

### Create Issue

| Field | Type | Required | Rules |
|---|---|---|---|
| `projectId` | uuid | ✅ | لازم يتبع workspace المستخدم عضو فيه |
| `title` | string | ✅ | 1–200 |
| `description` | string | ⚪ | Markdown كنص عادي، حتى 20,000 |
| `status` | enum | ⚪ | لو اليوزر ماغيرهاش، **الفرونت مش بيبعتها** والسيرفر يطبق `DEFAULT_ISSUE_STATUS` |
| `priority` | enum | ⚪ | نفس الكلام: `DEFAULT_ISSUE_PRIORITY` |
| `assigneeId` | uuid \| null | ⚪ | لازم عضو في نفس الـ workspace. `null` = Unassigned |
| `dueDate` | `YYYY-MM-DD` \| null | ⚪ | |
| `labelIds` | uuid[] | ⚪ | الـ labels لازم من نفس الـ workspace. اقتراح: حتى 10 |

- `id`, `createdAt`, `updatedAt`, `createdBy` = 🔧.
- **مفيش issue key** (زي `ENG-104`) في التصميم. الـ title هو المُعرّف الأساسي.
- **الـ defaults:** المقترح `todo` للـ status و`no_priority` للـ priority، وبيتعرّفوا **مرة واحدة عند الباك اند** (والفرونت عنده نسخة مطابقة) كـ `DEFAULT_ISSUE_STATUS` و`DEFAULT_ISSUE_PRIORITY`. الفرونت بيستورد نفس الثوابت عشان الـ form تعرض الـ default الصح من غير ما يتكرر تعريفه، والسيرفر هو اللي بيطبقه فعليًا. والـ response دايمًا بيرجع القيمة النهائية (مش `null`).

### Edit Issue (inline)
نفس الحقول كلها، **كل property بتتعدل لوحدها** (PATCH). كل تعديل لازم يتسجل في `activities` (🔧).

### Delete Issue
`issueId`.

### Bulk actions (My Issues وقايمة الـ issues)

| Field | Type | Required | ملاحظات |
|---|---|---|---|
| `issueIds` | uuid[] | ✅ | ❓ **Q13:** حد أقصى (اقتراح 100) |
| `patch.status` | enum | ⚪ | |
| `patch.priority` | enum | ⚪ | |
| `patch.assigneeId` | uuid \| null | ⚪ | |
| `patch.addLabelIds` / `patch.removeLabelIds` | uuid[] | ⚪ | **add/remove** مش replace (**Q13**) |
| Bulk delete | `issueIds` | ✅ | |

- المطلوب إن العملية **atomic** (كلها تنجح أو كلها تفشل)، ولو فيه issue مش مسموح بيها يرجع الخطأ بتفاصيل.

### فلاتر قايمة الـ Issues (query params)

بتتشارك بين: صفحة المشروع، My Issues، قايمة issues الـ workspace (**Q14**)، والـ saved views.

| Param | Type | ملاحظات |
|---|---|---|
| `status` | enum[] | **أكتر من قيمة** (مثلًا `backlog,todo`) عشان تايلز الـ Dashboard تفتح قايمة صح (**Q6**) |
| `priority` | enum[] | |
| `projectId` | uuid | |
| `labelIds` | uuid[] | ❓ **Q19** في My Issues |
| `assigneeId` | uuid \| `me` \| `none` | `none` = Unassigned |
| `overdue` | boolean | "Overdue Only": `dueDate < today` وحالتها مش `done`/`cancelled` |
| `q` | string | بحث في الـ title |
| `sort` | string | ❓ **Q20** |
| `page`, `pageSize` | int | التصميم فيه "Rows: 50" و"Page 1 of 1". محتاجين `total` في الـ response (**Q20**) |

**شكل الـ issue في القايمة:** `id`, `title`, `status`, `priority`, `dueDate`, `project {id, name}`, `assignee {id, name} | null`, `labels [{id, name, color}]`، و**في My Issues (cross-workspace) لازم كمان** `workspace {id, name, slug}` عشان الفرونت يبني اللينك `/[slug]/issues/[id]`.

---

## 5. Comments

### Create Comment

| Field | Type | Required | Rules |
|---|---|---|---|
| `issueId` | uuid | ✅ | |
| `body` | string | ✅ | 1–5,000 |
| `mentionUserIds` | uuid[] | ⚪ | الأعضاء اللي اتختاروا من dropdown الـ @mention |

- **Q12:** الـ `body` بيتخزن نص عادي فيه `@Ramez K.`، و`mentionUserIds` منفصلة. الفرونت **هيبعت بس الـ ids اللي لسه موجودة في النص** (لو اليوزر مسح الـ mention). والباك اند يتأكد إن كل id عضو في الـ workspace.
- الـ dropdown محتاج endpoint يرجع أعضاء الـ workspace (`id`, `name`).
- Activity history: قراءة فقط، من `activities` (🔧).

---

## 6. Labels

### Create / Edit Label

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | 1–30، بيتعمله trim. التصميم فيه أسماء زي `p0-blocker`. ❓ **Q22:** فريد (غير حساس لحالة الحروف) جوه الـ workspace؟ |
| `color` | enum | ✅ | **واحد من الـ 6 بس.** مفيش hex مخصص |

- **Q3:** **الـ color بيتخزن كـ key** (`violet`) **مش hex**. السبب: الفرونت بيختار قيمة اللون المناسبة للـ light والـ dark mode، والـ hex الثابت ممكن يبوظ الـ contrast في الـ dark.
- مفيش description، ولا categories، ولا scope.
- Delete: `labelId`. وبيتشال من كل الـ issues تلقائيًا.
- القايمة بترجع `issueCount` لكل label.

---

## 7. Saved Views

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | 1–60 |
| `filters` | object | ✅ | **Q4** |

- **Q4: شكل الـ `filters`:** اقتراح JSON بنفس أسماء الـ query params في القسم 4: `{ status?: string[], priority?: string[], projectId?, labelIds?: string[], assigneeId?: "me"|"none"|uuid, overdue?: boolean }`. ومفيش query string نصي (زي `is:open due:<today`).
- الـ views تابعة لـ **workspace واحد** ولشخص واحد (مفيش Personal/Shared، ومفيش Default).
- **إزاي بتتعمل:** من صفحة قايمة الـ issues بتاعة الـ workspace (`/[workspaceSlug]/issues`)، بزرار "Save as view" بياخد **الفلاتر الحالية كما هي** واليوزر بيكتب الاسم بس. مفيش form فيه filter builder.
- **Update:** تعديل الاسم بس (PATCH `name`). تغيير فلاتر view موجودة مش في النسخة دي.
- ❓ **Q5:** الـ sidebar بيعرض **عدد الـ issues لكل view**. الـ API يرجعه ولا نشيله؟ (حسابه من الفرونت معناه request لكل view).
- Update (PATCH) وDelete: `viewId`.

---

## 8. Quick Search (⌘K)

| Param | Type | Required | Rules |
|---|---|---|---|
| `q` | string | ✅ | الحد الأدنى 2 حرف. الفرونت بيعمل debounce (~250ms) |
| `limit` | int | ⚪ | اقتراح 8 |

- **النطاق: global**، يعني كل الـ workspaces اللي المستخدم عضو فيها (قرار مأخوذ). عشان كده كل نتيجة لازم ترجع `workspace {id, name, slug}`.
- ❓ **Q18:** بيبحث في إيه (title بس، ولا title + description)؟
- النتيجة issues بس: `id`, `title`, `status`, `project {name}`, `workspace {name, slug}`.

---

## 9. الأرقام المحسوبة (Aggregations)

### أ) تجميع الـ statuses في التايلز

الـ backend عنده 6 statuses، لكن كل تايل في التصميم رقم واحد. فاتفقنا على التجميع ده:

| التايل | الـ statuses | الاسم في الشاشة |
|---|---|---|
| Open | `backlog` + `todo` | Open |
| In Progress | `in_progress` + `in_review` | In Progress |
| Done | `done` فقط | Done |
| Overdue | `dueDate < today` **وحالتها مش** `done` ولا `cancelled` | Overdue |

- `cancelled` **مش بتظهر في أي تايل**. فمجموع التايلز ممكن مايساويش إجمالي الـ issues، وده مقصود.
- **مثال:** workspace فيه 48 issue: `backlog 5, todo 7, in_progress 4, in_review 3, done 24, cancelled 5` → Open **12** / In Progress **7** / Done **24** / Overdue **3**، والـ 5 المتبقيين cancelled.
- **المطلوب من الباك اند (Q7):** يرجع **عدد لكل status لوحده** (`countsByStatus` بالـ 6 مفاتيح) + `overdueCount`. والفرونت هو اللي بيجمع. ده معناه إن تغيير التجميع بعدين مايحتاجش تعديل في الباك اند. أما الـ **Overdue** فلازم يتحسب في الباك اند لأنه بيحتاج التاريخ.
- ❓ **Q15:** "today" بتتحسب بتوقيت إيه (UTC ولا توقيت المستخدم)؟ بما إن `dueDate` تاريخ بس، اقتراح: الفرونت يبعت `today` (`YYYY-MM-DD` بتوقيت المستخدم) كـ param.

### ب) باقي الأرقام

| الرقم | بيظهر فين | التعريف المقترح |
|---|---|---|
| **Priority Overview** | Dashboard | عدد الـ issues لكل priority (**5 صفوف** بما فيها `no_priority` عشان المجموع يطابق الإجمالي) |
| **My Issues: Assigned** | My Issues | issues المسندة للمستخدم عبر كل الـ workspaces وحالتها مش `done`/`cancelled` |
| **My Issues: In Progress** | My Issues | المسندة له وحالتها `in_progress` أو `in_review` |
| **My Issues: Urgent/High** | My Issues | المسندة له و`priority` ∈ (`urgent`, `high`) وحالتها مش `done`/`cancelled` |
| **My Issues: Overdue** | My Issues | المسندة له وبتنطبق عليها قاعدة الـ Overdue |
| **Issue Volume** | Project detail | `total` + (Open / In Progress / Done) بنفس تجميع الأعلى |
| **Completion Rate** | Project detail | `done ÷ (total − cancelled)`. ❓ **Q16** (الـ PRD بيقول closed ÷ total) |
| **Critical Attention** | Project detail | **رقمين منفصلين:** `urgentCount` (urgent وحالتها مش `done`/`cancelled`) و`overdueCount`. ❓ **Q17** (الـ PRD بيقول "urgent + overdue" وده ممكن يعد issue مرتين) |
| **Unassigned** | Project detail | `assigneeId = null` وحالتها مش `done`/`cancelled` |
| **Project row counts** | Projects modal / Cross-workspace | `issueCount` (الكل)، `openCount` (Open بالتجميع)، `urgentCount` (urgent نشطة) |
| **Sidebar project count** | Sidebar | `issueCount` (الكل) |
| **Label issueCount** | Labels modal | كل الـ issues اللي عليها الـ label |
| **memberCount** | Workspace card | `COUNT` على `memberships` |
| **lastActivityAt** | Workspace card | أحدث `activities.created_at` لأي issue في الـ workspace. `null` لو مفيش. الفرونت هو اللي بيحوله لـ "4 min ago" |
| **Saved view count** | Sidebar / modal | ❓ **Q5** |

### ج) صفحة الـ Cross-Workspace (`/workspaces/all`)
بتعرض **المشاريع متجمعة حسب الـ workspace**: لكل workspace (name, projectCount, issueCount, openCount, urgentCount)، ولكل project جواه (name, description, issueCount, openCount, urgentCount). **مفيش** health، ولا completion، ولا status للمشروع غير اللي في **Q2**.

---

## 10. شكل الأخطاء (مطلوب من الباك اند)

الفرونت بيعرض كل خطأ **تحت الحقل الغلط**، ولازم يتربط بالحقل برمجيًا (لـ accessibility). فالمطلوب:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "Email is already registered" } } }
```

| Status | الاستخدام |
|---|---|
| `400` | validation (مع `fields`) |
| `401` | مش مسجل / بيانات دخول غلط |
| `403` | مسجل بس مش مسموح (مش عضو في الـ workspace، أو مش owner) |
| `404` | مش موجود (أو مش مسموح تعرف إنه موجود) |
| `409` | تكرار (email موجود، اسم label مكرر) |

---

## 11. الأسئلة المفتوحة للباك اند

**الأهم الأول (بيعطلوا صفحات):**

| #       | السؤال                                                                                                                                                                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1**  | الـ workspace `slug`: بيتولد من الاسم؟ فريد؟ بيتغير مع تغيير الاسم؟ `اه هيتولد اسم وفريد انما لا مش هيتغير مع تغير الاسم`                                                                                                                             |
| **Q2**  | إيه الـ project statuses بالظبط؟ `هتتلغي هتبقى لابيلز للمشاريع والوورك سبيس`                                                                                                                                                                          |
| **Q3**  | الـ label `color` بيتخزن كـ key (مقترح: `violet`, `magenta`, `indigo`, `olive`, `sand`, `plum`)؟ `اه وهو هيعمل كل الconstats وهيبقى يبعتهالي`                                                                                                         |
| **Q4**  | شكل الـ `filters` في الـ saved views (المقترح في القسم 7)، وهل `assigneeId: "me"` مدعوم؟ `بعدين`                                                                                                                                                      |
| **Q6**  | فلتر `status` بيقبل أكتر من قيمة؟ `اه تمام`                                                                                                                                                                                                           |
| **Q7**  | الـ dashboard بيرجع `countsByStatus` (6 مفاتيح) + `overdueCount`؟ `بعدين`                                                                                                                                                                             |
| **Q14** | فيه endpoint لقايمة issues على مستوى الـ workspace (فلاتر + search + pagination)؟ الفرونت محتاجه لـ: "All Issues"، و"View all issues"، وفتح الـ saved views، وتايلز الـ Dashboard. (الصفحة اتأكدت من ناحية الفرونت: `/[workspaceSlug]/issues`) `تمام` |

**الباقي:**

| #   | السؤال                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Q5  | الـ API يرجع count لكل saved view؟ `تمام`                                                                                              |
| Q8  | قواعد الباسورد اللي السيرفر هيفرضها (الطول بس؟) `عادي`                                                                                 |
| Q9  | الـ signup بيعمل session تلقائيًا؟ `اه`                                                                                                |
| Q10 | صلاحية رابط الدعوة، وهل هو reusable؟ `اه هيبقى له صلاحية اسبوع مثلا وهو من عنده هيقفله`                                                |
| Q11 | حذف project: cascade على الـ issues؟ `اه`                                                                                              |
| Q12 | شكل الـ @mention (`mentionUserIds` منفصلة عن الـ body)؟ `اه هيعمل ايند بوينت لكل اليوزرز اللي في البروجيكت وانا اختار اعمل منشن لانهي` |
| Q13 | حدود الـ bulk وسلوك الـ labels (add/remove)؟ `هيبقى في بالك ديليت لاكتر من حاجه`                                                       |
| Q15 | الـ "today" في الـ Overdue (الفرونت يبعتها كـ param؟) `اه`                                                                             |
| Q16 | معادلة الـ Completion Rate                                                                                                             |
| Q17 | تعريف الـ Critical Attention (رقمين منفصلين)                                                                                           |
| Q18 | الـ Quick Search نطاقه global (قرار مأخوذ). السؤال: بيبحث في إيه (title بس ولا title + description)؟                                   |
| Q19 | فلتر الـ label في My Issues (cross-workspace): الـ labels تابعة لكل workspace، فبيتفلتر بإيه؟                                          |
| Q20 | الـ sorting المدعوم، والـ pagination (`page`+`pageSize` مع `total`؟) `بعدين`                                                           |
| Q22 | قواعد الـ uniqueness (الاسم جوه الـ workspace للـ project والـ label) `في الليبل بس`                                                   |
| Q23 | الـ slugs المحجوزة (`workspaces`, `my-issues`, `sign-in`, `sign-up`, `join`, `api`): السيرفر بيرفضها أو بيضيف لها suffix؟              |
