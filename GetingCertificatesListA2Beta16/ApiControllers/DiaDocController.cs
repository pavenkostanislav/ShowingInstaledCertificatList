using CISLibApp.Basic.Common;
using CISLibApp.Common;
using CISLibApp.Models;
using CISLibApp.Tools;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using UACWebApp.Models;
using UACWebApp.OwnClasses;

namespace UACWebApp.Controllers
{
    public class DiaDocController : ApiController
    {
        [HttpPost, Route("api/diadoc/documents/list/get/{userId:int?}/{dateb?}/{datee?}/{currentPage:int?}/{pageSize:int?}")]
        public IHttpActionResult GetDocumentList([FromBody] object body, int? userId, string dateb, string datee, int currentPage, int pageSize)
        {
            using (var db = new cis(User.Identity.Name, userId))
            {
                try
                {
                    var jsonSerializeObject = JsonConvert.SerializeObject(body);
                    var findModel = JsonConvert.DeserializeObject<FindModelDiaDocument>(jsonSerializeObject, JsonSettings.RuDateTimeFormat);

                    var list = db.Documents.AsNoTracking().AsQueryable();

                    if (findModel.Num != null)
                    {
                        list = list.Where(m => m.DocumentNumber.Contains(findModel.Num)).AsQueryable();
                    }
                    if (findModel.Date != null)
                    {
                        var dt = findModel.Date.Value.ToString("dd.MM.yyyy");
                        list = list.Where(m => m.DocumentDate.Contains(dt)).AsQueryable();
                    }
                    if (findModel.ContractorId != null)
                    {
                        list = list.Where(m => m.ContractorId == findModel.ContractorId).AsQueryable();
                    }
                    if (findModel.CounteragentBoxId != null)
                    {
                        list = list.Where(m => m.CounteragentBoxId == findModel.CounteragentBoxId).AsQueryable();
                    }
                    if (findModel.DocTypeId != null)
                    {
                        list = list.Where(m => m.DocTypeId == findModel.DocTypeId).AsQueryable();
                    }
                    if (findModel.DocCardId != null)
                    {
                        list = list.Where(m => m.DocCardId == findModel.DocCardId).AsQueryable();
                    }
                    if (findModel.MessageId != null)
                    {
                        list = list.Where(m => m.MessageId == findModel.MessageId).AsQueryable();
                    }
                    if (findModel.Text != null)
                    {
                        list = list.Where(
                                m =>
                                    m.EntityId.ToString().Contains(findModel.Text) ||
                                    m.DocumentNumber.Contains(findModel.Text) ||
                                    m.FileName.Contains(findModel.Text) ||
                                    m.DocType.Name.Contains(findModel.Text) ||
                                    m.DocCardId.ToString().Contains(findModel.Text)
                                ).AsQueryable();
                    }

                    return Json<object>(GetDocCardResponceModel(db, list, dateb, datee, currentPage, pageSize), JsonSettings.RuDateTimeFormat);
                }
                catch (Exception ex)
                {
                    return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
                }
            }
        }

        [HttpGet, Route("api/diadoc/document/load/{messageId}/{entityId}/{userId:int?}")]
        public IHttpActionResult LoadDocument(Guid messageId, Guid entityId, int? userId)
        {
            var _diadocApi = new Diadoc.Api.DiadocApi(DiadocConstants.DiadocClientId, DiadocConstants.DiadocApiUrl, new Diadoc.Api.Cryptography.WinApiCrypt());
            var diadocAuthTokenLogin = _diadocApi.Authenticate(DiadocConstants.DiadocLogin, DiadocConstants.DiadocPassword);
            try
            {
                using (var db = new cis(User.Identity.Name, userId))
                {
                    var uacBoxId = db.GetDiadocBoxId(Constant.OwnerId);
                    var document = db.Documents.FirstOrDefault(m => m.MessageId == messageId && m.EntityId == entityId && m.DocCardId == null);
                    byte[] fileStream = GetDiadocFileStream(_diadocApi, diadocAuthTokenLogin, uacBoxId, document);
                    string fileName = db.GetDiadocFileName(document) + ".zip";
                    db.DocIntegrationInsert(document.Id, fileName, fileStream, db.CurrentUser.Id);
                    while (db.Documents.Any(m => m.MessageId == messageId && m.EntityId == entityId && m.DocCardId == null))
                    {
                        continue;
                    }
                    var list = db.Documents.Where(m => m.MessageId == messageId &&  m.EntityId == entityId).AsNoTracking().AsQueryable();
                    return Json<object>(GetDocCardResponceModel(db, list, string.Empty, string.Empty, 0, 15), JsonSettings.RuDateTimeFormat);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
            }
        }

        [HttpGet, Route("api/diadoc/documents/list/load/{messageId}/{userId:int?}")]
        public IHttpActionResult LoadDocumentsList(Guid messageId, int? userId)
        {
            var _diadocApi = new Diadoc.Api.DiadocApi(DiadocConstants.DiadocClientId, DiadocConstants.DiadocApiUrl, new Diadoc.Api.Cryptography.WinApiCrypt());
            var diadocAuthTokenLogin = _diadocApi.Authenticate(DiadocConstants.DiadocLogin, DiadocConstants.DiadocPassword);
            try
            {
                using (var db = new cis(User.Identity.Name, userId))
                {
                    
                    var uacBoxId = db.GetDiadocBoxId(Constant.OwnerId);
                    var parentDocCard = Tools.CopyEntity(db.DocCards.FirstOrDefault(m => db.Documents.Any(m2 => m2.MessageId == messageId && m2.DocCardId == m.Id) && m.ParentDocCardId == null));

                    foreach (var item in db.Documents.Where(m => m.MessageId == messageId && m.DocCardId == null).ToList())
                    {
                        byte[] fileStream = GetDiadocFileStream(_diadocApi, diadocAuthTokenLogin, uacBoxId, item);
                        string fileName = db.GetDiadocFileName(item) + ".zip";
                        db.DocIntegrationInsertNew(item, fileName, fileStream, parentDocCard.Id);
                    }
                    while (db.Documents.Any(m => m.MessageId == messageId && m.DocCardId == null))
                    {
                        continue;
                    }
                    //var doclist = db.Documents.AsNoTracking().Where(m => m.MessageId == messageId && m.DocCardId != null && m.DocCardId != parentDocCard.Id);
                    //foreach (var item in doclist)
                    //{
                    //    var docCard = db.DocCards.Find(item.DocCardId);
                    //        docCard.ParentDocCardId = parentDocCard.Id;
                    //        docCard.IsPacket = true;
                    //        if (!db.DocCardReferences.Any(dcr => dcr.ParentId == docCard.ParentDocCardId.Value && dcr.ChildId == docCard.Id))
                    //        {
                    //            var dcr = new DocCardReference
                    //            {
                    //                ParentId = docCard.ParentDocCardId.Value,
                    //                ChildId = docCard.Id
                    //            };
                    //            db.DocCardReferences.Add(dcr);
                    //        }
                    //}
                    //db.SaveChanges();

                    var list = db.Documents.Where(m => m.MessageId == messageId).AsNoTracking().AsQueryable();
                    return Json<object>(GetDocCardResponceModel(db, list, string.Empty, string.Empty, 0, 15), JsonSettings.RuDateTimeFormat);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
            }
        }

        [HttpPost, Route("api/diadoc/documents/list/set/{userId:int?}")]
        public IHttpActionResult SetDocumentList(int? userId, [FromBody] List<EasyDiaDocument> bodylist)
        {
            using (var db = new cis(User.Identity.Name, userId))
            {
                try
                {
                    //var objStr = JsonConvert.SerializeObject(bodylist);
                    //var list = JsonConvert.DeserializeObject<List<EasyDiaDocument>>(objStr, JsonSettings.RuDateTimeFormat);
                    var list = new List<Document>();
                    foreach (var item in bodylist)
                    {
                        list.Add(SetDocumentChangeFields(db, item));
                    }
                    db.SaveChanges();

                    //foreach (var item in list.Where(doc => doc.DocCardId > 0 && doc.Active))
                    //{
                    //    LoadZip(db, item);
                    //}

                    return Json<object>(new { result = "Документы успешно связаны и будут загружены в ближайшее время" });
                }
                catch (Exception ex)
                {
                    return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
                }
            }
        }

        [HttpPost, Route("api/diadoc/documents/set/{userId:int?}")]
        public IHttpActionResult SetDocument(int? userId, [FromBody] EasyDiaDocument body)
        {
            using (var db = new cis(User.Identity.Name, userId))
            {
                try
                {
                    var doc = SetDocumentChangeFields(db, body);

                    db.SaveChanges();

                    return Json<object>(new { result = "Документы успешно связаны и будут загружены в ближайшее время" });
                }
                catch (Exception ex)
                {
                    return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
                }
            }
        }

        [HttpGet, Route("api/diadoc/document/get/url/{messageId}/{entityId}")]
        public IHttpActionResult GetDocumentUrl(string messageId, string entityId)
        {
            using (var db = new cis(User.Identity.Name))
            {
                try
                {
                    string getObjectEditUrl = Constant.GetObject(Constant.ExternalLinksURL.DiadocDocument)?.EditUrl;
                    if (getObjectEditUrl == null)
                    {
                        throw new Exception("Не указана строка удалённой карточки в перечислениях");
                    }
                    string getDiadocBox = db.GetDiadocBoxId(Constant.OwnerId, (int)Constant.ExtSystem.Diadoc_BoxId);

                    return Json<object>(string.Format(getObjectEditUrl, getDiadocBox, messageId, entityId));
                }
                catch (Exception ex)
                {
                    return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
                }
            }
        }

        [HttpGet, Route("api/diadoc/document/get/url/{docId:int?}")]
        public IHttpActionResult GetDocumentUrl2(int docId)
        {
            if (docId > 0)
            {
                using (var db = new cis(User.Identity.Name))
                {
                    try
                    {
                        string getObjectEditUrl = Constant.GetObject(Constant.ExternalLinksURL.DiadocDocument)?.EditUrl;
                        if (getObjectEditUrl == null)
                        {
                            throw new Exception("Не указана строка удалённой карточки в перечислениях.");
                        }
                        string getDiadocBox = db.GetDiadocBoxId(Constant.OwnerId, (int)Constant.ExtSystem.Diadoc_BoxId);

                        var diadocDocument = db.Documents.FirstOrDefault(m => m.DocCardId == docId);
                        if(diadocDocument == null)
                        {
                            throw new Exception("Не связана не одна карточка диадок.");
                        }

                        return Json<object>(string.Format(getObjectEditUrl, getDiadocBox, diadocDocument.MessageId.ToString(), diadocDocument.EntityId.ToString()));
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
                    }
                }
            }
            return null;
        }

        private static Document SetDocumentChangeFields(cis db, EasyDiaDocument item)
        {
            if (item.DocCardId > 0 && item.Active)
            {
                foreach (var document in db.Documents.Where(m => m.DocCardId == item.DocCardId))
                {
                    document.Active = false;
                }
            }
            var doc = db.Documents.Find(item.Id);
            doc.DocCardId = item.DocCardId;
            doc.DocTypeId = GetDocCardTypeId(db, doc);
            doc.Active = item.Active;
            return doc;
        }
        /*
        private static void LoadZip(cis db, Document item)
        {
            if (!item.DocCardId.HasValue)
            {
                throw new Exception("Попытка загрузить файл в не связанный документ");
            }
            var uacBoxId = db.GetDiadocBoxId(Constant.OwnerId);
            var _diadocApi = new DiadocApi(DiadocConstants.DiadocClientId, DiadocConstants.DiadocApiUrl, new Diadoc.Api.Cryptography.WinApiCrypt());
            var diadocAuthTokenLogin = _diadocApi.Authenticate(DiadocConstants.DiadocLogin, DiadocConstants.DiadocPassword);
            var file = _diadocApi.GenerateDocumentZip(diadocAuthTokenLogin, uacBoxId, item.MessageId.ToString(), item.EntityId.ToString(), true);
            while (file.RetryAfter > 0)
            {
                System.Threading.Thread.Sleep(file.RetryAfter * 1000);
                file = _diadocApi.GenerateDocumentZip(diadocAuthTokenLogin, uacBoxId, item.MessageId.ToString(), item.EntityId.ToString(), true);
            }
            var fileStream = _diadocApi.GetFileFromShelf(diadocAuthTokenLogin, file.ZipFileNameOnShelf);
            string fileName = db.GetDiadocFileName(item) + ".zip";

            AttachmentTools.AddAttachment(fileStream, fileName, item.CreationTimestamp, item.DocCardId.Value);
        }
        */
        private static int GetDocCardTypeId(cis db, Document doc)
        {
            if (doc.DocCardId > 0)
            {
                var docCard = db.DocCards.Find(doc.DocCardId);
                return docCard.DocumentTypeId;
            }
            else
            {
                var docDirectTypeTemp = doc.DocumentDirection + "." + doc.DocumentType.ToString();
                var docType = db.GetDiadocDocType(doc.DocumentDirection, doc.DocumentType);
                return docType != null ? docType.ObjectId : (int)CISLibApp.Common.Constant.DocumentTypes.DocCardDiadoc;
            }
        }

        private static DocCardResponceModel GetDocCardResponceModel(cis db, IQueryable<Document> list, string dateb, string datee, int currentPage, int pageSize)
        {
            var metaTable = db.MetaObjects.FirstOrDefault(mo => mo.Id == (int)Constant.Table.DocCard);

            DateTime? _dateb = null;
            DateTime? _datee = null;
            var ruCultureInfo = CultureInfo.GetCultureInfo("ru-Ru");

            if (!string.IsNullOrWhiteSpace(dateb))
            {
                _dateb = Convert.ToDateTime(dateb, ruCultureInfo);
            }

            if (!string.IsNullOrWhiteSpace(datee))
            {
                _datee = Convert.ToDateTime(datee, ruCultureInfo);
                _datee = _datee.Value.AddDays(1);
            }

            var totalRowCount = list.AsNoTracking().Count();

            var ret = new DocCardResponceModel();
            ret.ownerBoxId = db.GetDiadocBoxId(Constant.OwnerId);
            ret.TotalRowCount = totalRowCount;
            ret.CurrentPage = 0;
            ret.TotalRowCount = list.AsNoTracking().Count();

            if (currentPage > totalRowCount / pageSize + 1)
            {
                currentPage = 0;
            }
            else
            {
                ret.CurrentPage = currentPage;
            }

            int s = pageSize * currentPage;
            int t = pageSize;

            list = list.OrderByDescending(m => m.CreationTimestamp).Skip(s).Take(t);

            ret.List = list
                .Where(m => (!_dateb.HasValue || m.CreationTimestamp >= _dateb.Value) && (!_datee.HasValue || m.CreationTimestamp <= _datee.Value))
                .Select(m => new {
                    id = m.Id,
                    editUrl = m.DocCardId.HasValue ? metaTable.EditUrl.Replace("{0}", m.DocCardId.Value.ToString()) : metaTable.DefaultUrl,
                    isDocCardParent = db.DocCards.Any(dc => dc.Id == m.DocCardId && dc.ParentDocCardId == null),
                    parentId = m.ParentId,
                    subDocCount = db.Documents.Count(mes => mes.MessageId == m.MessageId),
                    docType = m.DocType.Name,
                    status = m.Status,
                    vat = m.Vat,
                    total = m.Total,
                    currency = m.Currency,
                    documentStatus = m.DocumentStatus,
                    revocationStatus = m.RevocationStatus,
                    resolutionStatusType = m.ResolutionStatusType,
                    documentNumber = m.DocumentNumber,
                    documentDate = m.DocumentDate,
                    documentType = m.DocumentType,
                    fileName = m.FileName.Contains("XML") ? (db.ExtIntegrations.FirstOrDefault(
                                    ExtInt =>
                                        ExtInt.MetaObjectId == (int)CISLibApp.Common.Constant.Table.DocumentType &&
                                        ExtInt.ExtSystemId == (int)CISLibApp.Common.Constant.ExtSystem.Diadoc_DocumentTypeDotDocumentClass &&
                                        ExtInt.ExternalId == (m.DocumentDirection + "." + m.DocumentType.ToString())).Description) + " №" + m.DocumentNumber + " от " + m.DocumentDate : m.FileName,
                    counteragentBoxId = m.CounteragentBoxId,
                    counteragentBox = db.ExtIntegrations.FirstOrDefault(
                                    ExtInt =>
                                        ExtInt.MetaObjectId == (int)CISLibApp.Common.Constant.Table.Contractor &&
                                        ExtInt.ExtSystemId == (int)CISLibApp.Common.Constant.ExtSystem.Diadoc_Box &&
                                        ExtInt.ExternalId == m.CounteragentBoxId).Description,
                    messageId = m.MessageId,
                    entityId = m.EntityId,
                    docCardId = m.DocCardId,
                    docCardDocNumber = m.DocCardId.HasValue ? db.DocCards.FirstOrDefault(dc => dc.Id == m.DocCardId).DocNumber : string.Empty,
                    contractorId = m.ContractorId,
                    contractor = m.Contractor.FullName,
                    docTypeId = m.DocTypeId,
                    active = m.Active,
                    creationTimestamp = m.CreationTimestamp,
                    createdBy = m.CreatedBy,
                    createdDate = m.CreatedDate,
                    lastUpdatedBy = m.LastUpdatedBy,
                    lastUpdatedDate = m.LastUpdatedDate
                })
                            .ToList<object>();
            return ret;
        }

        private static byte[] GetDiadocFileStream(Diadoc.Api.DiadocApi _diadocApi, string diadocAuthTokenLogin, string uacBoxId, Document document)
        {
            var file = _diadocApi.GenerateDocumentZip(diadocAuthTokenLogin, uacBoxId, document.MessageId.ToString(), document.EntityId.ToString(), true);
            while (file.RetryAfter > 0)
            {
                System.Threading.Thread.Sleep(file.RetryAfter * 1000);
                //    file = _diadocApi.GeneratePrintForm(diadocAuthTokenLogin, uacBoxId, item.MessageId.ToString(), item.EntityId.ToString());
                file = _diadocApi.GenerateDocumentZip(diadocAuthTokenLogin, uacBoxId, document.MessageId.ToString(), document.EntityId.ToString(), true);
            }
            var fileStream = _diadocApi.GetFileFromShelf(diadocAuthTokenLogin, file.ZipFileNameOnShelf);
            return fileStream;
        }
        
        [HttpPost, Route("api/diadoc/Authenticate")]
        public IHttpActionResult Authenticate([FromBody] object body)
        {
            try
            {
                var _diadocApi = new Diadoc.Api.DiadocApi(DiadocConstants.DiadocClientId, DiadocConstants.DiadocApiUrl, new Diadoc.Api.Cryptography.WinApiCrypt());
                var requestX509 = JsonConvert.DeserializeObject<EasyCert>(JsonConvert.SerializeObject(body), JsonSettings.RuDateTimeFormat);
                var x509 = new System.Security.Cryptography.X509Certificates.X509Certificate2();
                x509.Import(Convert.FromBase64String(requestX509.Signature));

                //x509.PrivateKey = JsonConvert.DeserializeObject<System.Security.Cryptography.RSACryptoServiceProvider>(JsonConvert.SerializeObject(requestX509.PrivateKey), JsonSettings.RuDateTimeFormat);


                //var x509 = DiaDocController.GetCertificate();
                //var authTokenCert1 = _diadocApi.Authenticate(x509.Thumbprint);
                //var b = x509.RawData;
                //var authTokenCert2 = _diadocApi.Authenticate(x509.RawData);

                var authTokenCert = _diadocApi.Authenticate(x509.RawData);
                return Json<string>("OK!");
            }
            catch (Exception ex)
            {
                return BadRequest(CISLibApp.Basic.Tools.BasicTools.GetErrorMessage(ex));
            }
        }

        private static System.Security.Cryptography.X509Certificates.X509Certificate2 GetCertificate()
        {
            System.Security.Cryptography.X509Certificates.X509Store store = new System.Security.Cryptography.X509Certificates.X509Store(System.Security.Cryptography.X509Certificates.StoreName.My, System.Security.Cryptography.X509Certificates.StoreLocation.CurrentUser);
            store.Open(System.Security.Cryptography.X509Certificates.OpenFlags.ReadOnly | System.Security.Cryptography.X509Certificates.OpenFlags.OpenExistingOnly);

            System.Security.Cryptography.X509Certificates.X509Certificate2Collection collection = store.Certificates.Find(System.Security.Cryptography.X509Certificates.X509FindType.FindByTimeValid, DateTime.Now, false);
            collection = collection.Find(System.Security.Cryptography.X509Certificates.X509FindType.FindByIssuerName, "skbkontur.ru", false);
            System.Security.Cryptography.X509Certificates.X509Certificate2Collection scollection = null;

            while (true)
            {
                scollection = System.Security.Cryptography.X509Certificates.X509Certificate2UI.SelectFromCollection(collection, "Установленные на ПК сертификаты ЗАО ПФ СКБ Контур", "Сделайте выбор сертификата для подписания документов в системе диадок", System.Security.Cryptography.X509Certificates.X509SelectionFlag.MultiSelection);
                if (scollection.Count == 0)
                {
                    throw new Exception("Внимание!!!: Сертификат не выбран!");
                }
                if (scollection.Count == 1)
                {
                    Console.WriteLine("Выбран сертификат: {0}", scollection[0].FriendlyName);
                    break;
                }
                if (scollection.Count > 1)
                {
                    Console.WriteLine("Внимание!!!: Выбрано более одного сертификата!\nСделайте уникальный выбор из доступных сертификатов для аутентификации в системе диадок.");
                    continue;
                }
                break;
            }
            return scollection[0];
        }
        
        [HttpPost, Route("api/cryptopro/uploadsignedfile")]
        public async Task<HttpResponseMessage> UploadSignedFile()
        {
            try
            {
                if (!Request.Content.IsMimeMultipartContent())
                {
                    throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                }

                var root = HttpContext.Current.Server.MapPath("~/App_Data");
                var provider = new MultipartFormDataStreamProvider(root);

                await Request.Content.ReadAsMultipartAsync(provider);

                var _moId = provider.FormData["metaObjectId"];
                if (_moId == null) throw new Exception("Не обнаружена связь с таблицей");
                var moId = 0;
                if (!int.TryParse(_moId, out moId))
                {
                    return null;
                }

                var _oId = provider.FormData["objectId"];
                if (_oId == null) throw new Exception("Не обнаружен документ ПКМ");
                var oId = 0;
                if (!int.TryParse(_oId, out oId))
                {
                    return null;
                }

                foreach (var file in provider.FileData)
                {
                    var filename = (file.Headers.ContentDisposition.FileName).Replace("\"", "");
                    var fileBin = File.ReadAllBytes(file.LocalFileName);
                    var ct = file.Headers.ContentType.ToString();
                    using (var db = new cis())
                    {
                        db.CurrentUser = MetaUserTools.GetCurrentMetaUser(User.Identity.Name);

                        AttachmentTools.UploadAttachment(db, fileBin, filename, filename, ct, Constant.GetConstantValue(Constant.DocumentTypes.AttachDiadoc), false, moId, oId, false);
                    }
                }
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }

    public class EasyDiaDocument
    {
        public int Id { get; set; }
        public int? DocCardId { get; set; }
        public bool Active { get; set; }
        public int? DocTypeId { get; set; }
    }
    public class FindModelDiaDocument
    {
        public string Text { get; set; }
        public int? ContractorId { get; set; }
        public string CounteragentBoxId { get; set; }
        public int? DocTypeId { get; set; }
        public string Num { get; set; }
        public Guid? MessageId { get; set; }
        public DateTime? Date { get; set; }
        public int? DocCardId { get; set; }
        public DateTime datee { get; set; }
        public DateTime dateb { get; set; }
    }
    public class EasyCert
    {
        public string Subject { get; set; }
        public string Issuer { get; set; }
        //public DateTime from { get; set; }
        //public DateTime till { get; set; }
        public string Algorithm { get; set; }
        public string Provname { get; set; }
        public string Thumbprint { get; set; }
        public string Signature { get; set; }
        public object PrivateKey { get; set; }
    }
}