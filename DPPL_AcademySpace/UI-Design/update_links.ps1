$files = Get-ChildItem -Path "c:\academy_space\UI-Design" -Filter *.html

$map = @{
    "login.html" = "FR-01-Membuat_atau_Masuk_Akun_Login.html"
    "register.html" = "FR-01-Membuat_atau_Masuk_Akun_Register.html"
    "profile.html" = "FR-02-Mengelola_Profil.html"
    "facility-detail.html" = "FR-07-Melihat_Detail_Ruangan.html"
    "check-availability.html" = "FR-04-Melihat_Jadwal_dan_Ketersediaan_Fasilitas.html"
    "notifications.html" = "FR-05-Menerima_Notifikasi_Approval_Rejection.html"
    "home.html" = "FR-06-Mencari_Fasilitas.html"
    "edit-reservation.html" = "FR-08-Mengedit_atau_Membatalkan_Reservasi.html"
    "my-reservations.html" = "FR-10-Melihat_Riwayat_Reservasi.html"
    "guide.html" = "FR-16-Melihat_Guide_Penggunaan_Website.html"
    "forgot-password.html" = "EXT-Mereset_Password.html"
    "admin-reservations.html" = "FR-09-Menyetujui_atau_Menolak_Reservasi.html"
    "admin-facilities.html" = "FR-11-Mengelola_Fasilitas.html"
    "admin-facilities-create.html" = "FR-11-Mengelola_Fasilitas_Create.html"
    "admin-facilities-edit.html" = "FR-11-Mengelola_Fasilitas_Edit.html"
    "admin-analytics.html" = "FR-17-Melihat_Analitik_dan_Pelaporan.html"
    "admin-system-tokens.html" = "FR-15-Mengambil_Token_Sistem.html"
    "admin-profile.html" = "FR-02-Mengelola_Profil_Admin.html"
    "admin-dashboard.html" = "Admin_Dashboard.html"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $newContent = $content
    foreach ($key in $map.Keys) {
        $newContent = $newContent -replace "href=""$key""", "href=""$($map[$key])"""
        $newContent = $newContent -replace "href='$key'", "href='$($map[$key])'"
    }
    if ($content -ne $newContent) {
        $newContent | Set-Content $file.FullName
        Write-Host "Updated $($file.Name)"
    }
}
