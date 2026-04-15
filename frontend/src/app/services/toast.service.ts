import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(title: string, message = '') { 
    toast.success(title, { description: message }); 
  }
  
  error(title: string, message = '') { 
    toast.error(title, { description: message }); 
  }
  
  warning(title: string, message = '') { 
    toast.warning(title, { description: message }); 
  }
  
  info(title: string, message = '') { 
    toast.info(title, { description: message }); 
  }
}
