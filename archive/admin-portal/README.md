# Admin Portal Archive (පසු භාවිතය සඳහා සුරක්ෂිත කළ පරිපාලක පුවරුව)

මෙම ෆෝල්ඩරයේ සුරක්ෂිත කර ඇත්තේ DPTS පද්ධතියේ Admin Portal එකට අදාළ ලිපිගොනු සහ කේතයන්ය. පරිශීලක ඉල්ලීම පරිදි ("e tika passe damu"), මෙම කොටස් ප්‍රධාන යෙදුමෙන් (main app) ඉවත් කර පසුව පහසුවෙන් නැවත එක් කරගත හැකි වන පරිදි මෙහි සංරක්ෂණය කර ඇත.

---

## සංරක්ෂිත ලිපිගොනු (Archived Files):

1. **`client/pages/AdminPanel.jsx`**:
   - පරිපාලක පාලක පුවරුව (Admin Dashboard).
   - අලුතින් ලියාපදිංචි වන නිලධාරීන්ගේ ගිණුම් අනුමත කිරීම (Approve), ප්‍රතික්ෂේප කිරීම (Reject), සක්‍රිය/අක්‍රිය කිරීම සහ ගිණුම් කළමනාකරණය.
2. **`client/pages/AdminPanel.css`**:
   - Admin Panel සඳහා වන සම්පූර්ණ මෝස්තර (Styles).
3. **`server/controllers/userController.js`**:
   - පරිපාලක සඳහා සියලුම පරිශීලකයින් ලබාගැනීම (`getAllUsers`), තත්ත්වය යාවත්කාලීන කිරීම (`updateUserStatus`), සහ ඉවත් කිරීම (`deleteUser`).
4. **`server/routes/userRoutes.js`**:
   - `/api/users` මාර්ග (Routes) - Admin පමණක් අවසර ඇති API endpoints.
5. **`server/seedAdmin.js`**:
   - ආරම්භක Admin ගිණුමක් ස්වයංක්‍රීයව දත්ත සමුදායට (MongoDB) ඇතුළත් කිරීමේ ස්ක්‍රිප්ට් එක.

---

## නැවත Admin Portal එක සක්‍රිය කිරීමට අවශ්‍ය වූ විට (How to Restore):

1. `archive/admin-portal/client/pages/AdminPanel.jsx` සහ `AdminPanel.css` ගොනු `client/src/pages/` වෙත පිටපත් කරන්න.
2. `archive/admin-portal/server/controllers/userController.js` ගොනුව `server/controllers/` වෙත පිටපත් කරන්න.
3. `archive/admin-portal/server/routes/userRoutes.js` ගොනුව `server/routes/` වෙත පිටපත් කරන්න.
4. `server/server.js` හි `app.use('/api/users', userRoutes)` එක් කරන්න.
5. `client/src/App.jsx` හි `AdminPanel` පිටුව සහ route එක සක්‍රිය කරන්න.
6. `client/src/components/Navbar.jsx` හි Admin සඳහා වන Admin Panel button එක සක්‍රිය කරන්න.
