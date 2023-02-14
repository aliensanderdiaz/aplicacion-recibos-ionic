import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from '@awesome-cordova-plugins/file-transfer/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  crearPostOk = false
  tomarFotoOk = false

  recibo!: any
  photos: string[] = [];
  photosSend: string[] = [];
  fileTransfer!: FileTransferObject;

  fotoEnAmazon: boolean = false
  reciboCargado: boolean = false

  url = 'https://recibos-backend-production.up.railway.app'
  // url = 'http://192.168.20.20:3000'

  token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Il9pZCI6IjYzY2IyODUxMWI5ZjAyODE4MWM5Y2JiMSIsIm5vbWJyZSI6ImFsZXgiLCJlbWFpbCI6ImFsZXhAZ21haWwuY29tIiwiYXZhdGFyIjoiYXYtMS5wbmcifSwiaWF0IjoxNjc0MjU4NTEzLCJleHAiOjE2NzY4NTA1MTN9.Qb5BWBZoGDOmCzERfE1vTywl3LIS_tSTVqwClHp7iCY';

  constructor(private transfer: FileTransfer, private http: HttpClient) {
    this.fileTransfer = this.transfer.create();
  }

  async abrirCamara() {
    console.log({
      funcion: 'Abrir Camara',
    });
    const image = await Camera.getPhoto({
      quality: 100,
      // allowEditing: true,
      width: 350,
      presentationStyle: 'popover',
      // height: 250,
      webUseInput: false,
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri,
    });

    const imageUrl: string = <string>image.webPath;
    const imageUrlSend: string = <string>image.path;
    this.photos.push(imageUrl);
    this.photosSend.push(imageUrlSend);
    this.upload();
  }

  upload() {
    console.log({
      funcion: 'upload',
    });
    let options: FileUploadOptions = {
      fileKey: 'image',
      fileName: this.recibo.etiqueta + '.jpg',
      headers: {
        'x-token': this.token,
      },
    };

    console.log({ options });

    this.fileTransfer
      .upload(
        this.photosSend[0],
        this.url + '/posts/upload',
        options
      )
      .then(
        (data) => {
          // success
          console.log({ data });
          this.fotoEnAmazon = true
        },
        (err) => {
          // error
          console.error({ err });
        }
      );
  }

  crearRecibo() {
    const recibo = {
      cliente: 'Alexander Diaz',
      total: 50000,
      fechaDeEntrega: '2023-01-31',
    };

    this.http.post(this.url + '/posts/crear', recibo).subscribe({
      next: (data: any) => {
        console.log({ data });
        this.recibo = data.reciboDB
        console.log({ 'this.recibo': this.recibo })
        this.crearPostOk = true
      },
      error: (error) => {
        console.error({ error });
      },
    });
  }

  obtenerRecibo() {
    if (!this.fotoEnAmazon) {
      return
    }
    this.http.get(this.url + '/posts/' + this.recibo.etiqueta ).subscribe({
      next: (data: any) => {

        this.recibo = data
        console.log({ data });
        this.reciboCargado = true
      },
      error: (error) => {
        console.error({ error });
      },
    });
  }
}
