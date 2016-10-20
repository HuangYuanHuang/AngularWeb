using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AngularWeb.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpPost]
        public JsonResult List()
        {
            return Json(new object[] {
                new {
                    name="hyh",
                    age=18
            }, new {
                name="ddd",
                age=12
            } });
        }

      
        public ActionResult TreeItem()
        {
            return View();
        }
    }
}