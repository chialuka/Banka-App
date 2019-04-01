This is a web app for Banka. It supports online banking transactions and provides services for clients, staff and admin.

New clients can sign up for an account. Existing clients can log in. When logged in, a client can open one of the available types of bank accounts offered by the Bank. Client can view account history and records from the Client dashboard. Client can also logout and edit profile. From the Edit Profile page, client can reset password.

No transactions can occur on an account that is not activated. New accounts are deactivated byu deactivated by default. Admin however can activate any account. When an account is activated, then staff or admin can credit or debit the account. Overdrafts aren't allowed therefore no withdrawal can be made above client's balance. 

Admin can also create new admin or staff account. Staff and Admin can login from the landing page.

The app uses local storage to save all the information entered. It serves as database. Client transactions and history can therefore be seen in real time. Clients are identified by tokens saved in local storage. When they are logged in, they also have a logged in token generated so that their accounts are protected from other users when logged out.