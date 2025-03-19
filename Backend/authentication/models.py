from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser

class usermanager(BaseUserManager):
    def create_user(self,username,password,email,**extrafields):
        if not email:
            raise ValueError("email is mandatory")
        if not username:
            raise ValueError("username is mandatory")
        user=self.model(email=self.normalize_email(email),
                        username=username,
                        **extrafields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self,username,password,email,**extrafields):
        extrafields.setdefault('is_staff',True)
        extrafields.setdefault('is_admin',True)
        return self.create_user('','',username,password,email,**extrafields)

class User(AbstractBaseUser):
    email=models.EmailField(unique=True)
    username=models.CharField(max_length=50,unique=True)
    first_name=models.CharField(max_length=50,null=True,blank=True)
    last_name=models.CharField(max_length=50,null=True,blank=True)
    created_date=models.DateTimeField(auto_now_add=True)
    is_active=models.BooleanField(default=True)
    is_admin=models.BooleanField(default=False)
    is_staff=models.BooleanField(default=False)
    objects= usermanager()
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['password']

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin
    
    class Meta:
        db_table="users"


