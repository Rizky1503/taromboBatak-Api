'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')


Route.get('/', 'Admin/AdminController.test')

Route.group(() => {
	Route.post('login', 'Admin/AdminController.login')
}).prefix('api/v1/login')


Route.group(() => {

	Route.post('tambah_marga', 'Admin/AdminController.tambah_marga')
	Route.get('list_marga', 'Admin/AdminController.list_marga')
	Route.post('update_marga', 'Admin/AdminController.update_marga')
	
}).prefix('api/v1/marga')

Route.group(() => {

	Route.get('get_marga', 'Admin/AdminController.get_marga')
	Route.get('get_provinsi', 'Admin/AdminController.get_provinsi')
	Route.post('get_kota', 'Admin/AdminController.get_kota')
	Route.get('get_member', 'Admin/AdminController.get_member')
	Route.get('get_memberId/:id', 'Admin/AdminController.get_memberId')
	Route.post('get_keturunan', 'Admin/AdminController.get_keturunan')
	Route.post('tambah_member', 'Admin/AdminController.tambah_member')
	Route.post('update_member', 'Admin/AdminController.update_member')
	Route.get('list_member', 'Admin/AdminController.list_member')
	Route.get('count_requested', 'Admin/AdminController.count_requested')
	Route.post('count_requested', 'Admin/AdminController.count_requested')
	Route.post('status_member', 'Admin/AdminController.status_member')
	Route.post('status_admin', 'Admin/AdminController.status_admin')
	Route.post('get_ayah', 'Admin/AdminController.get_ayah')

	Route.get('GetMemberFromId/:id', 'Admin/AdminController.GetMemberFromId')

	Route.post('GetMemberForMarga', 'Admin/AdminController.GetMemberForMarga')
	Route.post('PohonSilsilah', 'Admin/AdminController.PohonSilsilah')
	
}).prefix('api/v1/member')