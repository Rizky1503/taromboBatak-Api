'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

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

	async update_marga ({response,request}){
		const Inputs = request.only(['id_marga','marga'])
		const list = await Database
			.from('in_marga')
			.where('id_marga',Inputs.id_marga)
  			.update('nama_marga', Inputs.marga)
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
			.whereNotNull('id_marga')
		return response.json(member)
	}

	async get_memberId({response,params}){
			const ChangeStatusOrder = await Database.raw("select *,  to_char(tanggal_lahir, 'DD/MM/YYYY') as tanggal_lahir from in_member where id_member = '"+params.id+"' ")
		return response.json(ChangeStatusOrder.rows)
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
		const Inputs = request.only(['id_marga','level'])
		const ayah = await Database
			.select('in_member.nama','in_relation.id_relationship')
			.table('in_relation')
			.leftJoin('in_member','in_relation.suami','in_member.id_member')
			.where('in_member.id_marga',Inputs.id_marga)
			.where('in_member.jenis_kelamin','L')
			.where('in_member.level',Inputs.level)
			.orderBy('in_member.nama','ASC')
		return response.json(ayah)
	}

	async update_member({request,response}){
		const Inputs = request.only(['id_marga','nama','email','no_telpon','alamat','provinsi_kelahiran','kota_kelahiran','tanggal_lahir','nama_ayah','referensi','keturunan_ke','username','password','jenis_kelamin','level','id_member'])
		const store = await Database			
			.table('in_member')
			.where('id_member',Inputs.id_member)
			.update({
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
				updated_at : new Date(),
				jenis_kelamin : Inputs.jenis_kelamin, 
				level : Inputs.level,
			})
			return store
			
	} 

	async tambah_member ({request,response}){		
		const Inputs = request.only(['id_marga','nama','email','no_telpon','alamat','provinsi_kelahiran','kota_kelahiran','tanggal_lahir','nama_ayah','referensi','keturunan_ke','username','password','jenis_kelamin','level','id_member'])
		const store = await Database			
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
				updated_at : new Date(),
				jenis_kelamin : Inputs.jenis_kelamin, 
				level : Inputs.level,
			}])
			.into('in_member')
			.returning('id_member')

			const data = await Database
				.from('in_silsilah')
				.insert([{
					id_member : store[0],
					id_marga : Inputs.id_marga,
					id_ayah : Inputs.nama_ayah
				}])

			if(Inputs.id_member){
				if (Inputs.jenis_kelamin == 'L') {
					const data = await Database
						.from('in_relation')
						.insert([{
							suami : store[0],
							istri : Inputs.id_member
						}])
				}else{
					const data = await Database
						.from('in_relation')
						.insert([{
							istri : store[0],
							suami : Inputs.id_member
						}])
				}
			}

		return response.status(200).json({
            	status 	: true,
            	data 	: store[0]
        })

	}

	async GetMemberFromId ({request,response,params}){
		const Inputs = request.only(['id_member'])

		const count = await Database
			.count()
			.table('in_relation')
			.where('suami',params.id)
			.orWhere('istri',params.id)
			.first()

		if (count.count < 1){
			const member = await Database
				.query()
				.from('in_member')
				.where('id_member',params.id)
				.first()
			if (member.jenis_kelamin == 'L') {
				return response.json({
	            	suami 	: member,
	            	istri 	: [],
	            	count   : count.count,
	            	id_relation : [],
            		anak : []
        		})
			}else{
				return response.json({
	            	suami 	: [],
	            	istri 	: member,
	            	count   : count.count,
	            	id_relation : [],
            		anak : []
        		})
			}
			
		}else{
			const member = await Database
				.table('in_relation')
				.where('suami',params.id)
				.orWhere('istri',params.id)
				.first()

			const suami = await Database
				.query()
				.from('in_member')
				.where('id_member',member.suami)
				.first()

			const istri = await Database
				.query()
				.from('in_member')
				.where('id_member',member.istri)
				.first()

			const dataAnak = await Database
				.query()
				.table('in_silsilah')
				.where('id_ayah',member.id_relationship)

			var Tampung_Data_anak = [];
	  			for (var i = 0; i < dataAnak.length; i++) {	  			  		
	  				const soal_mata_pelajaran = await Database
				  		.query()
					  	.table('in_member')
					  	.where('id_member', dataAnak[i].id_member)
					  	.first()
				  		Tampung_Data_anak.push(soal_mata_pelajaran);	
			  }



			return response.json({
            	suami 	: suami,
            	istri 	: istri,
            	count   : count.count,
            	id_relation : member,
            	anak : Tampung_Data_anak
            })
		}

		
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
		if (Inputs.urutan == 'atas') {
			const master = await Database
			.select('in_member.nama','in_marga.nama_marga','in_silsilah.id_member','in_silsilah.id_ayah')
			.table('in_silsilah')
			.innerJoin('in_member','in_silsilah.id_member','in_member.id_member')
			.innerJoin('in_marga','in_silsilah.id_marga','in_marga.id_marga')
			.where('in_silsilah.id_marga',Inputs.id_marga)
			.where('in_silsilah.id_member',Inputs.id_member)
			if (master) {
				for (var keyAyah = 0; keyAyah < master.length; keyAyah++) {
					const ayah = await Database
					.select('in_member.nama','in_member.id_member','in_silsilah.id_ayah')
					.table('in_member')
					.innerJoin('in_relation','in_relation.suami','in_member.id_member')
					.innerJoin('in_silsilah','in_member.id_member','in_silsilah.id_member')
					.where('id_relationship',master[keyAyah].id_ayah)
					master[keyAyah]['ayah'] = ayah;
					if (ayah) {
						for(var keyKake = 0; keyKake < ayah.length; keyKake++) {
							const kake = await Database
								.select('in_member.nama','in_member.id_member','in_silsilah.id_ayah')
								.table('in_member')
								.innerJoin('in_relation','in_relation.suami','in_member.id_member')
								.innerJoin('in_silsilah','in_member.id_member','in_silsilah.id_member')
								.where('id_relationship',ayah[keyKake].id_ayah)
							ayah[keyKake]['ayah'] = kake;
							if (kake) {
								for(var keyUyut = 0; keyUyut < kake.length; keyUyut++) {
									const uyut_laki = await Database
									.select('in_member.nama','in_member.id_member','in_silsilah.id_ayah')
									.table('in_member')
									.innerJoin('in_relation','in_relation.suami','in_member.id_member')
									.innerJoin('in_silsilah','in_member.id_member','in_silsilah.id_member')
									.where('id_relationship',kake[keyUyut].id_ayah)
									kake[keyUyut]['ayah'] = uyut_laki;
									const uyut_cwe = await Database
									.select('in_member.nama','in_member.id_member')
									.table('in_member')
									.innerJoin('in_relation','in_relation.istri','in_member.id_member')
									.where('id_relationship',kake[keyUyut].id_ayah)
									kake[keyUyut]['ibu'] = uyut_cwe;
								}
							}else{

							}
							const nene = await Database
								.select('in_member.nama','in_member.id_member')
								.table('in_member')
								.innerJoin('in_relation','in_relation.istri','in_member.id_member')
								.where('id_relationship',ayah[keyKake].id_ayah)
							ayah[keyKake]['ibu'] = nene;
						}
					}else{
						ayah[keyKake]['ayah'] = [];
						ayah[keyKake]['ibu'] = [];
					}

					const ibu = await Database
					.select('in_member.nama','in_member.id_member')
					.table('in_member')
					.innerJoin('in_relation','in_relation.istri','in_member.id_member')
					.where('id_relationship',master[keyAyah].id_ayah)
					master[keyAyah]['ibu'] = ibu;
				}
			}else{
				master[keyAyah]['ayah'] = [];
				master[keyAyah]['ibu'] = [];
			}
			
				return master
		}else{
			const master = await Database
			.select('id_relationship','suami','istri')
			.table('in_relation')
			.where('in_relation.suami',Inputs.id_member)
			.orWhere('in_relation.istri',Inputs.id_member)
			.first()
			if (master) {
			const suami = await Database
			.select('nama','level')
			.table('in_member')
			.where('id_member',master.suami)
			.first()
			master['suami'] = suami

			const istri = await Database
			.select('nama')
			.table('in_member')
			.where('id_member',master.istri)
			.first()
			master['istri'] = istri

			const anak = await Database
			.query()
			.table('in_silsilah')
			.where('id_ayah',master.id_relationship)
			master['anak'] = anak
				for(var keyAnak = 0; keyAnak < anak.length; keyAnak++) {
					const masterAnak = await Database
					.select('id_relationship','suami','istri')
					.table('in_relation')
					.where('in_relation.suami',anak[keyAnak].id_member)
					.orWhere('in_relation.istri',anak[keyAnak].id_member)
					.first()
					if (masterAnak) {
					const suamiAnak = await Database
					.select('nama','level')
					.table('in_member')
					.where('id_member',masterAnak.suami)
					.first()
					anak[keyAnak]['suami'] = suamiAnak

					const istriAnak = await Database
					.select('nama')
					.table('in_member')
					.where('id_member',masterAnak.istri)
					.first()
					anak[keyAnak]['istri'] = istriAnak

					const cucu = await Database
					.query()
					.table('in_silsilah')
					.where('id_ayah',masterAnak.id_relationship)
					anak[keyAnak]['anak'] = cucu
						for(var keyCucu = 0; keyCucu < cucu.length; keyCucu++) {
							const masterCucu = await Database
							.select('id_relationship','suami','istri')
							.table('in_relation')
							.where('in_relation.suami',cucu[keyCucu].id_member)
							.orWhere('in_relation.istri',cucu[keyCucu].id_member)
							.first()
							if (masterCucu) {
							const suamiCucu = await Database
							.select('nama','level')
							.table('in_member')
							.where('id_member',masterCucu.suami)
							.first()
							cucu[keyCucu]['suami'] = suamiCucu

							const istriCucu = await Database
							.select('nama')
							.table('in_member')
							.where('id_member',masterCucu.istri)
							.first()
							cucu[keyCucu]['istri'] = istriCucu

							const cicit = await Database
							.query()
							.table('in_silsilah')
							.where('id_ayah',masterCucu.id_relationship)
							cucu[keyCucu]['anak'] = cicit
								for(var keyCicit = 0; keyCicit < cicit.length; keyCicit++) {
									const masterCicit = await Database
									.select('id_relationship','suami','istri')
									.table('in_relation')
									.where('in_relation.suami',cicit[keyCicit].id_member)
									.orWhere('in_relation.istri',cicit[keyCicit].id_member)
									.first()

									if (masterCicit) {
									const suamiCicit = await Database
									.select('nama','level')
									.table('in_member')
									.where('id_member',masterCicit.suami)
									.first()
									cicit[keyCicit]['suami'] = suamiCicit

									const istriCicit = await Database
									.select('nama')
									.table('in_member')
									.where('id_member',masterCicit.istri)
									.first()
									cicit[keyCicit]['istri'] = istriCicit

									
									}else{
									const suamiCicit = await Database
									.select('nama','level')
									.table('in_member')
									.where('id_member',cicit[keyCicit].id_member)
									.first()	

									cicit[keyCicit]['suami'] = suamiCicit
									cicit[keyCicit]['istri'] = []
									
									}
								}
							}else{
							const suamiAnak = await Database
							.select('nama','level')
							.table('in_member')
							.where('id_member',cucu[keyCucu].id_member)
							.first()
							cucu[keyCucu]['suami'] = suamiAnak
							cucu[keyCucu]['istri'] = []
							cucu[keyCucu]['anak'] = []
							}
						}
					anak[keyAnak]['istri'] = istriAnak
					}else{
					const suamiAnak = await Database
					.select('nama','level')
					.table('in_member')
					.where('id_member',anak[keyAnak].id_member)
					.first()
					anak[keyAnak]['suami'] = suamiAnak
					anak[keyAnak]['istri'] = []
					anak[keyAnak]['anak'] = []
					}
				}
			}else{
				const suami = await Database
				.select('nama','level')
				.table('in_member')
				.where('id_member',Inputs.id_member)
				.first()
				return ({suami : suami,istri : '' , anak : []})
			}
			return master
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
