import { Db1Connection } from '../src/infrastructure/database/index.ts';
import { usersTable } from '../src/infrastructure/database/postgres/schemas/db1/index.ts';
import { eq } from 'drizzle-orm';
import { PassService } from '../src/modules/auth/services/pass.service.ts';
const email='amisha.royalitservice@gmail.com';
const rows=await Db1Connection.getInstance().select().from(usersTable).where(eq(usersTable.email,email)).limit(1);
const u=rows[0];
console.log(JSON.stringify({found:!!u,emailVerified:u?.isEmailVerified,status:u?.status,hasPassword:!!u?.passwordHash&&!!u?.passwordSalt,passwordMatches:u?.passwordHash&&u?.passwordSalt?await new PassService().verify('Test@12345',u.passwordHash,u.passwordSalt):false,companyIdPresent:!!u?.companyId}));
process.exit(0);

