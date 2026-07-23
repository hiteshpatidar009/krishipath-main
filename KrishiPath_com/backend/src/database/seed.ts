import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Company } from '../models/company.model.js';
import { User } from '../models/user.model.js';
import { Campaign } from '../models/campaign.model.js';
import { Transaction } from '../models/wallet.model.js';
import { Notification } from '../models/notification.model.js';
import { publicId } from '../shared/id.js';

async function seed() {
  await connectDatabase();
  const company = await Company.findOneAndUpdate({ companyId: 'KP-C-00842' }, { $set: { name: 'AgroGrow India Pvt. Ltd.', initials: 'AG', category: 'Fertilizer', email: 'admin@agrogrow.in', phone: '9876543210', contactName: 'Arjun Mehta', address: 'Pune, Maharashtra', state: 'Maharashtra', status: 'approved', verified: true, walletBalance: 124500, totalRecharged: 177000, totalSpent: 52500, platformFees: 3000 } }, { upsert: true, new: true });
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const root = await User.findOneAndUpdate({ email: 'admin@agrogrow.in' }, { $set: { company: company._id, publicId: 'u-001', name: 'Arjun Mehta', passwordHash, role: 'root', roleLabel: 'Company Root', permissions: ['all'], status: 'active' } }, { upsert: true, new: true });
  await User.findOneAndUpdate({ email: 'priya@agrogrow.in' }, { $set: { company: company._id, publicId: 'u-002', name: 'Priya Sharma', passwordHash, role: 'admin', roleLabel: 'Admin', permissions: ['campaigns','leads','analytics','team','wallet','wallet_topup','rewards'], status: 'active' } }, { upsert: true });
  if (!(await Campaign.exists({ company: company._id }))) {
    await Campaign.create([
      { publicId: 'c-001', company: company._id, createdBy: root._id, updatedBy: root._id, name: 'Kharif Season Fertilizer Drive', goal: 'Product Awareness', description: 'Promote balanced crop nutrition', status: 'active', reach: 18400, videoViews: 13400, quizCompletions: 8800, brochureDownloads: 3200, callbackRequests: 142, walletUsed: 34200, dailyBudget: 2000, launchDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), targetStates: ['Maharashtra','Punjab','Uttar Pradesh'], targetCrops: ['Cotton','Wheat'], videoReward: 2, quizReward: 5, brochureReward: 1, callbackReward: 20 },
      { publicId: 'c-002', company: company._id, createdBy: root._id, updatedBy: root._id, name: 'Pest Control Awareness Campaign', goal: 'Lead Generation', description: 'Integrated pest management awareness', status: 'active', reach: 9800, videoViews: 6800, quizCompletions: 4200, brochureDownloads: 1380, callbackRequests: 60, walletUsed: 17600, dailyBudget: 1500, launchDate: new Date('2026-06-15'), endDate: new Date('2026-09-15'), targetStates: ['Maharashtra','Gujarat'], targetCrops: ['Cotton','Soybean'], videoReward: 3, quizReward: 5, brochureReward: 2, callbackReward: 20 },
    ]);
  }
  if (!(await Transaction.exists({ company: company._id }))) await Transaction.create({ publicId: 'txn-020', company: company._id, type: 'campaign-spend', amount: -600, description: 'Campaign: Pest Control Awareness', balance: 124500, createdBy: root._id });
  if (!(await Notification.exists({ company: company._id }))) await Notification.create({ publicId: publicId('n'), company: company._id, category: 'system', title: 'Welcome to KrishiPath', message: 'Your company portal backend is ready.', read: false, link: '/' });
  console.log('Seed complete. Demo login: admin@agrogrow.in / demo1234');
  await disconnectDatabase();
}
seed().catch(async (error) => { console.error(error); await disconnectDatabase(); process.exit(1); });
