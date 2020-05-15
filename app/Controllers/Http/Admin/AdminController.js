'use strict'
const Database = use('Database')
const Encryption = use('Encryption')

class AdminController {

// start login
	async login({request,response}){
		const pelangganInfo = request.only(['username','password'])
		const cekEmail = await Database.from('in_member').where('username',pelangganInfo.username).where('status_admin','1').first() 
		if(cekEmail){
			if (Encryption.decrypt(cekEmail.password) == pelangganInfo.password) {
				return response.status(200).json({
					cekEmail,
					status: 'true',
			  	})		
			}else{
				return response.json({status : 'false'})	
			}

		}else{
			return response.json({status : 'false'})	
		}
	}
// end login

// start marga 
	async tambah_marga ({request,response}){
		const Inputs = request.only(['marga','alamat'])
		const store = await Database
			.from('in_marga')
			.insert([{
				nama_marga: Inputs.marga, 
				alamat: Inputs.alamat, 
				created_at : new Date(), 
				updated_at : new Date()
			}])
		return response.json('berhasil')
	}

	async list_marga ({response}){
		const list = await Database
			.query()
			.from('in_marga')
			.orderBy('id_marga','ASC')
		return response.json(list)
	}

	async delete_marga ({response,request}){
		const Inputs = request.only(['id_marga'])
		const list = await Database
			.from('in_marga')
			.where('id_marga',Inputs.id_marga)
			.delete()
		return response.json('berhasil')
	}
// end marga

// start member
	async get_marga({response}){
		const list = await Database
			.query()
			.from('in_marga')
			.orderBy('id_marga','ASC')
		return response.json(list)
	}

	async get_provinsi({response}){
		const provinsi = await Database
			.select('provinsi')
			.from('in_alamat')
			.orderBy('provinsi','ASC')
			.groupBy('provinsi')
		return response.json(provinsi)
	}

	async get_member({response}){
		const member = await Database
			.query()
			.table('in_member')
			.orderBy('nama','ASC')
			.where('status_member','Approved')
		return response.json(member)
	}

	async get_member({response}){
		const member = await Database
			.query()
			.table('in_member')
			.orderBy('nama','ASC')
			.where('status_member','Approved')
		return response.json(member)
	}

	async get_keturunan({response,request}){
		const Inputs = request.only(['id_marga'])
		const keturunan = await Database
			.select('keturunan_ke')
			.from('in_silsilah')
			.where('id_marga',Inputs.id_marga)
			.groupBy('keturunan_ke')
			.orderBy('keturunan_ke','ASC')
		return response.json(keturunan)
	}

	async get_kota({response,request}){
		const Inputs = request.only(['provinsi'])
		const kota = await Database
			.select('kota')
			.from('in_alamat')
			.where('provinsi',Inputs.provinsi)
			.orderBy('kota','ASC')
			.groupBy('kota')
		return response.json(kota)
	}

	async get_ayah({response,request}){
		const Inputs = request.only(['id_marga'])
		const ayah = await Database
			.select('in_member.nama','in_member.id_member')
			.table('in_silsilah')
			.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
			.where('in_silsilah.id_marga',Inputs.id_marga)
			.orderBy('in_member.nama','ASC')
		return response.json(ayah)
	}

	async tambah_member ({request,response}){
		const Inputs = request.only(['id_marga','nama','email','no_telpon','alamat','provinsi_kelahiran','kota_kelahiran','tanggal_lahir','nama_ayah','referensi','keturunan_ke','username','password'])
		const store = await Database
			.from('in_member')
			.insert([{
				id_marga: Inputs.id_marga,
				nama: Inputs.nama, 
				email: Inputs.email, 
				no_telpon: Inputs.no_telpon, 
				alamat: Inputs.alamat, 
				provinsi_kelahiran: Inputs.provinsi_kelahiran, 
				kota_kelahiran: Inputs.kota_kelahiran, 
				tanggal_lahir: Inputs.tanggal_lahir, 
				nama_ayah: Inputs.nama_ayah, 
				referensi: Inputs.referensi, 
				username: Inputs.username, 
				password: Encryption.encrypt(Inputs.password), 
				status_member: 'Approved', 
				created_at : new Date(), 
				updated_at : new Date() 
			}])
			.returning('id_member')

		 const silsilah = await Database
		 	.from('in_silsilah')
		 	.insert([{
				id_member : store[0],
				id_marga  : Inputs.id_marga, 
				id_ayah   : Inputs.nama_ayah 
			}])
		return response.json('berhasil')
	}

	async list_member ({request,response}){
		const list = await Database
			.query()
			.from('in_member')
			.innerJoin('in_marga','in_member.id_marga','in_marga.id_marga')
			.innerJoin('in_silsilah','in_member.id_member','in_silsilah.id_member')
			.orderBy('in_member.nama','ASC')
		return response.json(list)
	}

	async status_member ({request,response}){
		const Inputs = request.only(['id_member','status_member'])
		const status_member = await Database
			.table('in_member')
			.where('id_member', Inputs.id_member)
			.update('status_member', Inputs.status_member)
		return response.json('berhasil')
	}

	async status_admin ({request,response}){
		const Inputs = request.only(['id_member','status_admin'])
		const status_admin = await Database
			.table('in_member')
			.where('id_member', Inputs.id_member)
			.update('status_admin', Inputs.status_admin)
		return response.json('berhasil')
	}

	async GetMemberForMarga ({request,response}){
		const Inputs = request.only(['id_marga'])
		const ayah = await Database
			.select('in_member.nama','in_member.id_member')
			.table('in_silsilah')
			.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
			.where('in_silsilah.id_marga',Inputs.id_marga)
			.where('in_member.status_member','Approved')
			.orderBy('in_member.nama','ASC')
		return response.json(ayah)
	}

	async PohonSilsilah ({request,response}){
		const Inputs = request.only(['id_marga','id_member','urutan'])
		if (Inputs.urutan == 'bawah') {
			const master = await Database
				.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member')
				.table('in_silsilah')
				.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
				.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
				.where('in_silsilah.id_marga',Inputs.id_marga)
				.where('in_silsilah.id_member',Inputs.id_member)
			for (var keyMaster = 0; keyMaster < master.length; keyMaster++) {
				const satu = await Database
				.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member')
				.table('in_silsilah')
				.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
				.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
				.where('in_silsilah.id_marga',Inputs.id_marga)
				.where('in_silsilah.id_ayah',master[keyMaster].id_member)
				master[keyMaster]['children'] = satu;
				for (var keySatu = 0; keySatu < satu.length; keySatu++) {
					const dua = await Database
					.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member')
					.table('in_silsilah')
					.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
					.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
					.where('in_silsilah.id_marga',Inputs.id_marga)
					.where('in_silsilah.id_ayah',satu[keySatu].id_member)
					satu[keySatu]['children'] = dua;
					for (var keyDua = 0; keyDua < dua.length; keyDua++) {
						const tiga = await Database
						.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member')
						.table('in_silsilah')
						.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
						.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
						.where('in_silsilah.id_marga',Inputs.id_marga)
						.where('in_silsilah.id_ayah',dua[keyDua].id_member)
						dua[keyDua]['children'] = tiga;
					}
				}
			}
			return response.json(master)
		}else{
			const master = await Database
				.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member','in_silsilah.id_ayah')
				.table('in_silsilah')
				.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
				.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
				.where('in_silsilah.id_marga',Inputs.id_marga)
				.where('in_silsilah.id_member',Inputs.id_member)

			for (var satu = 0; satu < master.length; satu++) {
					const data = await Database
						.table('in_silsilah')
						.select('id_member','id_ayah')
						.where('id_marga',Inputs.id_marga)
						.where('id_member', master[satu].id_ayah)
						.first()
					if (!data) {
						master[satu]['children'] = [];
					}else{
					const ayah = await Database
						.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member','in_silsilah.id_ayah')
						.table('in_silsilah')
						.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
						.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
						.where('in_silsilah.id_marga',Inputs.id_marga)
						.where('in_silsilah.id_ayah',data.id_ayah)
					master[satu]['children'] = ayah;

					for (var dua = 0; dua < ayah.length; dua++) {
						const data = await Database
							.table('in_silsilah')
							.select('id_member','id_ayah')
							.where('id_marga',Inputs.id_marga)
							.where('id_member', ayah[dua].id_ayah)
							.first()
						if (!data) {
							ayah[dua]['children'] = [];
						}else{
							const kake = await Database
								.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member','in_silsilah.id_ayah')
								.table('in_silsilah')
								.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
								.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
								.where('in_silsilah.id_marga',Inputs.id_marga)
								.where('in_silsilah.id_ayah',data.id_ayah)						
							if (ayah[dua].id_member == master[satu].id_ayah) {
								ayah[dua]['children'] = kake;
							}else{
								ayah[dua]['children'] = [];
							}

							for (var tiga = 0; tiga < kake.length; tiga++) {
								const data = await Database
									.table('in_silsilah')
									.select('id_member','id_ayah')
									.where('id_marga',Inputs.id_marga)
									.where('id_member', kake[tiga].id_ayah)
									.first()
								if (!data) {
									kake[tiga]['children'] = [];
								}else{
								const uyut = await Database
									.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member','in_silsilah.id_ayah')
									.table('in_silsilah')
									.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
									.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
									.where('in_silsilah.id_marga',Inputs.id_marga)
									.where('in_silsilah.id_ayah',data.id_ayah)						
								if (kake[tiga].id_member == ayah[dua].id_ayah) {
									kake[tiga]['children'] = uyut;
								}else{
									kake[tiga]['children'] = [];
								}
							}
						}						
					}
				 }
			  }
			}
			

			

				
			return response.json(master)
		}
		
	}
// end member

// start home
	async count_requested({response}){
		const count = await Database
			.table('in_member')
			.where('status_member','Requested')
			.count()
		return response.json(count)
	}
// end home
}

module.exports = AdminController
